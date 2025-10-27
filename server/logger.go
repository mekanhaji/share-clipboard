package main

import (
	"fmt"
	"log"
	"os"
	"strings"
)

// Level represents logging severity
type Level int

const (
	DEBUG Level = iota
	INFO
	WARN
	ERROR
	FATAL
)

func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

var (
	configuredLevel = INFO
	std             = log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds)
)

func init() {
	lvl := os.Getenv("LOG_LEVEL")
	if lvl == "" {
		configuredLevel = INFO
		return
	}
	switch strings.ToUpper(lvl) {
	case "DEBUG":
		configuredLevel = DEBUG
	case "INFO":
		configuredLevel = INFO
	case "WARN", "WARNING":
		configuredLevel = WARN
	case "ERROR", "ERR":
		configuredLevel = ERROR
	case "FATAL":
		configuredLevel = FATAL
	default:
		configuredLevel = INFO
	}
}

func shouldLog(l Level) bool {
	// Only log messages at or above the configured level.
	return l >= configuredLevel
}

func logf(l Level, format string, v ...interface{}) {
	if !shouldLog(l) {
		return
	}
	prefix := fmt.Sprintf("[%s] ", l.String())
	std.Printf(prefix+format, v...)
}

func logln(l Level, v ...interface{}) {
	if !shouldLog(l) {
		return
	}
	prefix := fmt.Sprintf("[%s] ", l.String())
	std.Println(prefix + fmt.Sprint(v...))
}

// Formatting helpers
func Debugf(format string, v ...interface{}) { logf(DEBUG, format, v...) }
func Infof(format string, v ...interface{})  { logf(INFO, format, v...) }
func Warnf(format string, v ...interface{})  { logf(WARN, format, v...) }
func Errorf(format string, v ...interface{}) { logf(ERROR, format, v...) }
func Fatalf(format string, v ...interface{}) {
	logf(FATAL, format, v...)
	os.Exit(1)
}

// Simple println helpers
func Debug(v ...interface{}) { logln(DEBUG, v...) }
func Info(v ...interface{})  { logln(INFO, v...) }
func Warn(v ...interface{})  { logln(WARN, v...) }
func Error(v ...interface{}) { logln(ERROR, v...) }
func Fatal(v ...interface{}) {
	logln(FATAL, v...)
	os.Exit(1)
}

// SetLevel allows programmatic level changes
func SetLevel(name string) {
	switch strings.ToUpper(name) {
	case "DEBUG":
		configuredLevel = DEBUG
	case "INFO":
		configuredLevel = INFO
	case "WARN", "WARNING":
		configuredLevel = WARN
	case "ERROR", "ERR":
		configuredLevel = ERROR
	case "FATAL":
		configuredLevel = FATAL
	default:
		configuredLevel = INFO
	}
}
