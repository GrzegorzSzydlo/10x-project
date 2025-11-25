#!/bin/bash

# Test script for POST /api/projects endpoint
# This script demonstrates the API usage and validates the implementation

echo "🚀 Testing POST /api/projects endpoint"
echo "======================================="

# Test 1: Missing Content-Type
echo "Test 1: Missing Content-Type header"
curl -X POST http://localhost:4321/api/projects \
  -d '{"name":"Test Project"}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

# Test 2: Invalid JSON
echo "Test 2: Invalid JSON body"
curl -X POST http://localhost:4321/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

# Test 3: Missing authentication
echo "Test 3: Missing authentication"
curl -X POST http://localhost:4321/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project"}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

# Test 4: Validation error - name too short
echo "Test 4: Validation error - name too short"
curl -X POST http://localhost:4321/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"name":"Hi"}' \
  -w "\nStatus: %{http_code}\n" \
  -s
echo ""

echo "✅ Manual testing script ready"
echo "To run with real server: npm run dev, then ./test-endpoint.sh"