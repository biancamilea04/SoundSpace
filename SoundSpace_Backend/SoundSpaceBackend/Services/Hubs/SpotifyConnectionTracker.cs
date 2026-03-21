using System.Collections.Concurrent;

namespace SoundSpaceBackend.Services.Hubs;

public static class SpotifyConnectionTracker
{
    private static readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();

    public static void AddConnection(string spotifyId, string connectionId)
    {
        _userConnections.AddOrUpdate(
            spotifyId,
            _ => new HashSet<string> { connectionId },
            (_, connections) =>
            {
                lock (connections)
                {
                    connections.Add(connectionId);
                }
                return connections;
            });
    }

    public static void RemoveConnection(string spotifyId, string connectionId)
    {
        if (_userConnections.TryGetValue(spotifyId, out var connections))
        {
            lock (connections)
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                {
                    _userConnections.TryRemove(spotifyId, out _);
                }
            }
        }
    }

    public static IEnumerable<string> GetActiveUsers()
    {
        return _userConnections.Keys;
    }
}
