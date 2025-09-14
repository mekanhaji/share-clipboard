package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Room represents a chat room
type Room struct {
	ID          string                   `json:"id"`
	CreatedAt   time.Time                `json:"created_at"`
	Connections map[*websocket.Conn]bool `json:"-"`
	Mutex       sync.RWMutex             `json:"-"`
}

// Response structure for room creation
type CreateRoomResponse struct {
	RoomCode string `json:"room_code"`
	Message  string `json:"message"`
}

// Message structure for WebSocket communication
type Message struct {
	Type    string `json:"type"`
	Content string `json:"content"`
	Room    string `json:"room"`
}

// In-memory storage for rooms (in production, use a database)
var (
	rooms = make(map[string]*Room)
	mutex = sync.RWMutex{}
)

// generateRoomCode creates a unique 6-letter room code
func generateRoomCode() string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	for {
		code := make([]byte, 6)
		for i := range code {
			code[i] = letters[rand.Intn(len(letters))]
		}

		roomCode := string(code)

		// Check if the code already exists
		mutex.RLock()
		_, exists := rooms[roomCode]
		mutex.RUnlock()

		if !exists {
			return roomCode
		}
	}
}

// createRoom handles POST requests to create a new room
func createRoom(w http.ResponseWriter, r *http.Request) {
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Generate unique room code
	roomCode := generateRoomCode()

	// Create new room
	room := &Room{
		ID:          roomCode,
		CreatedAt:   time.Now(),
		Connections: make(map[*websocket.Conn]bool),
	}

	// Store room in memory
	mutex.Lock()
	rooms[roomCode] = room
	mutex.Unlock()

	// Prepare response
	response := CreateRoomResponse{
		RoomCode: roomCode,
		Message:  "Room created successfully",
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	// Send JSON response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Error encoding response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	log.Printf("Created room with code: %s", roomCode)
}

// enableCORS adds CORS headers to the response
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// corsMiddleware wraps handlers with CORS support
func corsMiddleware(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == "OPTIONS" {
			return
		}
		handler(w, r)
	}
}

// broadcastToRoom sends a message to all connections in a specific room
func broadcastToRoom(roomCode string, message []byte, sender *websocket.Conn) {
	mutex.RLock()
	room, exists := rooms[roomCode]
	mutex.RUnlock()

	if !exists {
		return
	}

	room.Mutex.RLock()
	defer room.Mutex.RUnlock()

	for conn := range room.Connections {
		// Don't send message back to sender
		if conn == sender {
			continue
		}

		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Error broadcasting to client: %v", err)
			// Remove disconnected client
			delete(room.Connections, conn)
			conn.Close()
		}
	}
}

// removeConnectionFromRoom removes a connection from a room
func removeConnectionFromRoom(roomCode string, conn *websocket.Conn) {
	mutex.RLock()
	room, exists := rooms[roomCode]
	mutex.RUnlock()

	if !exists {
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	delete(room.Connections, conn)
	log.Printf("Client disconnected from room %s. Remaining connections: %d", roomCode, len(room.Connections))
}

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Home Page")
}

// define a reader which will listen for
// new messages being sent to our WebSocket
// endpoint
func reader(conn *websocket.Conn, roomCode string) {
	defer func() {
		removeConnectionFromRoom(roomCode, conn)
		conn.Close()
	}()

	for {
		// read in a message
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			return
		}

		// Parse the incoming message
		var msg Message
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Printf("Error parsing message: %v", err)
			// If it's not JSON, treat it as plain text
			msg = Message{
				Type:    "text",
				Content: string(p),
				Room:    roomCode,
			}
		}

		// Ensure the message is for the correct room
		msg.Room = roomCode

		// Convert back to JSON for broadcasting
		messageBytes, err := json.Marshal(msg)
		if err != nil {
			log.Printf("Error marshaling message: %v", err)
			continue
		}

		log.Printf("Broadcasting message in room %s: %s", roomCode, msg.Content)

		// Broadcast to all clients in the room
		broadcastToRoom(roomCode, messageBytes, conn)
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// Get room code from query parameter
	roomCode := r.URL.Query().Get("room")
	if roomCode == "" {
		http.Error(w, "Room code is required", http.StatusBadRequest)
		return
	}

	// Check if room exists
	mutex.RLock()
	room, exists := rooms[roomCode]
	mutex.RUnlock()

	if !exists {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	// upgrade this connection to a WebSocket
	// connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Add connection to room
	room.Mutex.Lock()
	room.Connections[ws] = true
	connectionCount := len(room.Connections)
	room.Mutex.Unlock()

	log.Printf("New User Connected to room %s. Total connections: %d", roomCode, connectionCount)

	// Send welcome message to the new client
	welcomeMsg := Message{
		Type:    "system",
		Content: fmt.Sprintf("Welcome to room %s!", roomCode),
		Room:    roomCode,
	}
	welcomeBytes, _ := json.Marshal(welcomeMsg)
	ws.WriteMessage(websocket.TextMessage, welcomeBytes)

	// Notify other clients about new user
	joinMsg := Message{
		Type:    "system",
		Content: "A new user joined the room",
		Room:    roomCode,
	}
	joinBytes, _ := json.Marshal(joinMsg)
	broadcastToRoom(roomCode, joinBytes, ws)

	reader(ws, roomCode)
}

func setupRoutes() {
	http.HandleFunc("/", corsMiddleware(homePage))
	http.HandleFunc("/create-room", corsMiddleware(createRoom))
	http.HandleFunc("/ws", wsEndpoint) // WebSocket doesn't need CORS middleware
}

func main() {
	fmt.Println("Server initiating...")

	// Initialize random seed
	rand.Seed(time.Now().UnixNano())

	setupRoutes()
	fmt.Println("Server now listening on all interfaces at PORT:8080")
	fmt.Println("Access from network: http://10.184.250.123:8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
