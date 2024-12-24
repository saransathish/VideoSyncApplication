from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import eventlet

# Apply monkey patching to support eventlet
eventlet.monkey_patch()

app = Flask(__name__)

# Enable CORS for all origins (use a specific domain in production for security)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", logger=True)

@socketio.on("sync_action")
def handle_sync_action(data):
    """
    Broadcast sync actions to the other user.
    :param data: { action: 'play'/'pause'/'seek', timestamp: <float> }
    """
    emit("sync_action", data, broadcast=True, include_self=False)

@socketio.on("connect")
def handle_connect():
    print("A user connected.")

@socketio.on("disconnect")
def handle_disconnect():
    print("A user disconnected.")

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000)
