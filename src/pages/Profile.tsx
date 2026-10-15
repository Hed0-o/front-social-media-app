import { useContext, useEffect } from "react";
import { Avatar } from "@heroui/react";
import { getUserData } from "../services/user.service";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, setAuthUser } = useContext(AuthContext)!;

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await getUserData();
        setAuthUser(response.data.user);
      } catch (error) {
        console.log("User Data Error:", error);
      }
    }

    fetchUserData();
  }, [setAuthUser]);

  const profile = user;

  return (
    <main className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      <section className="overflow-hidden rounded-2xl border border-default-200 bg-content1">
        <div className="h-40 bg-linear-to-rfrom-primary/80 to-secondary/60 sm:h-52">
          {profile?.cover && (
            <img
              src={profile.cover}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="-mt-12 size-24 border-4 border-content1 bg-primary/10 sm:size-28">
              <Avatar.Image
                src={profile?.photo || ""}
                alt={profile?.name || "User"}
              />
              <Avatar.Fallback>
                {profile?.name?.charAt(0) || "U"}
              </Avatar.Fallback>
            </Avatar>

            <div className="min-w-0 flex-1 sm:pb-2">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {profile?.name || "User"}
              </h2>

              <p className="mt-1 text-sm text-default-500">
                @{profile?.username || "username"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-default-600">
            <p>{profile?.email}</p>

            <p>
              Joined{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Followers", value: profile?.followersCount ?? 0 },
          { label: "Following", value: profile?.followingCount ?? 0 },
          { label: "Bookmarks", value: profile?.bookmarksCount ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-default-200 bg-content1 p-4 text-center"
          >
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-default-500 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
