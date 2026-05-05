using System.Collections.Concurrent;

namespace SoundSpaceBackend.Hubs;

public class PresenceTracker
{
    private readonly ConcurrentDictionary<Guid, HashSet<string>> _connections = new();
    private readonly object _lock = new();

    public bool UserConnected(Guid userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var conns))
            {
                _connections[userId] = [connectionId];
                return true;
            }
            conns.Add(connectionId);
            return false;
        }
    }

    public bool UserDisconnected(Guid userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var conns))
                return false;

            conns.Remove(connectionId);

            if (conns.Count != 0)
                return false;

            _connections.TryRemove(userId, out _);
            return true;
        }
    }

    public IReadOnlyList<Guid> GetOnlineUsers() => [.. _connections.Keys];
}
