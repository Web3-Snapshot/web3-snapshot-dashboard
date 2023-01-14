import pytest

def test_hello(client):
	response = client.get('/api/hello')
	assert response.status_code == 200
	assert response.json["message"] == "Hello from Flask & Docker"