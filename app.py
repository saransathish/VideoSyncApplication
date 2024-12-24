from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

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
    socketio.run(app, debug=True)
