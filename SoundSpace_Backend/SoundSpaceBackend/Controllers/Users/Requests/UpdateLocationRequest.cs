using System.ComponentModel.DataAnnotations;

namespace SoundSpaceBackend.Controllers.Users.Requests;

public record UpdateLocationRequest(
    [Range(-90.0, 90.0)]   double Latitude,
    [Range(-180.0, 180.0)] double Longitude
);
