using AutoMapper;
using SoundSpaceBackend.Models.Entities;

namespace SoundSpaceBackend.Mapping.Profiles;
public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, User>();
    }
}