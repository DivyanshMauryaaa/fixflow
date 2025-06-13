export const createUserData = (user: any) => ({
  name: user?.fullName ?? "Unknown User",
  firstName: user?.firstName ?? "Unknown",
  lastName: user?.lastName ?? "User",
  email: user?.primaryEmailAddress ?? "unknown@example.com",
  avater: user?.imageUrl ?? "https://avatars.githubusercontent.com/u/1?v=4",
})