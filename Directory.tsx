import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Search, Loader2, UserCheck } from "lucide-react";
import { useLocation } from "wouter";

export default function Directory() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [filterSchool, setFilterSchool] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const utils = trpc.useUtils();

  const { data: pendingRequests } = trpc.connections.getPendingRequests.useQuery();
  const acceptRequestMutation = trpc.connections.acceptConnectionRequest.useMutation({
    onSuccess: () => {
      utils.connections.getPendingRequests.invalidate();
      utils.connections.getConnectionStatus.invalidate();
      utils.connections.getConnections.invalidate();
    },
  });

  const { data: searchResults, isLoading: searchLoading } = trpc.directory.searchAlumni.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: searchQuery.length > 0 }
  );

  const { data: byYear, isLoading: yearLoading } = trpc.directory.getByGraduationYear.useQuery(
    { year: filterYear || new Date().getFullYear(), limit: 50 },
    { enabled: !!filterYear }
  );

  const { data: bySchool, isLoading: schoolLoading } = trpc.directory.getBySchool.useQuery(
    { school: filterSchool, limit: 50 },
    { enabled: filterSchool.length > 0 }
  );

  const { data: allAlumni, isLoading: allLoading } = trpc.directory.getAllAlumni.useQuery(
    { limit, offset },
    { enabled: !searchQuery && !filterYear && !filterSchool }
  );

  let displayData = allAlumni || [];
  let isLoading = allLoading;

  if (searchQuery) {
    displayData = searchResults || [];
    isLoading = searchLoading;
  } else if (filterYear) {
    displayData = byYear || [];
    isLoading = yearLoading;
  } else if (filterSchool) {
    displayData = bySchool || [];
    isLoading = schoolLoading;
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Alumni Directory</h1>
          <div className="art-deco-line mx-auto w-48 mb-6"></div>
          <p className="text-xl text-muted-foreground">
            Connect with fellow graduates from your class
          </p>
        </div>

        {pendingRequests && pendingRequests.length > 0 && (
          <div className="card-luxury art-deco-frame mb-8 border-primary">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="text-primary" size={22} />
              <div>
                <h2 className="text-xl font-bold">Connection requests</h2>
                <p className="text-sm text-muted-foreground">These alumni are waiting for your response.</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                  <div>
                    <p className="font-semibold">{request.requester?.name || "An alumnus"}</p>
                    <p className="text-sm text-muted-foreground">{request.requester?.school || "Alumni community"}</p>
                  </div>
                  <Button
                    className="btn-luxury"
                    disabled={acceptRequestMutation.isPending}
                    onClick={() => acceptRequestMutation.mutate({ userId: request.connectedUserId })}
                  >
                    Accept Request
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-luxury art-deco-frame mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Graduation Year Filter */}
            <select
              value={filterYear || ""}
              onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Class of {year}
                </option>
              ))}
            </select>

            {/* School Filter */}
            <input
              type="text"
              placeholder="Filter by school..."
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterYear || filterSchool) && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterYear(null);
                setFilterSchool("");
              }}
              variant="outline"
              className="btn-luxury-outline"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Alumni Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : displayData.length > 0 ? (
          <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((alumni: any) => (
              <div
                key={alumni.id}
                className="card-luxury art-deco-frame cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setLocation(`/profile/${alumni.id}`)}
              >
                {/* Photo */}
                <div className="mb-4">
                  {alumni.profilePhotoUrl ? (
                    <img
                      src={alumni.profilePhotoUrl}
                      alt={alumni.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold mb-2 text-primary">{alumni.name || "Anonymous"}</h3>

                {alumni.school && (
                  <p className="text-sm text-muted-foreground mb-2">{alumni.school}</p>
                )}

                {alumni.graduationYear && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Class of {alumni.graduationYear}
                  </p>
                )}

                {alumni.bio && (
                  <p className="text-sm mb-4 line-clamp-2">{alumni.bio}</p>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/profile/${alumni.id}`);
                  }}
                  className="w-full btn-luxury"
                >
                  View Profile
                 </Button>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {displayData.length === limit && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setOffset(offset + limit)}
                className="btn-luxury"
              >
                Load More Alumni
              </Button>
            </div>
          )}
          </>
        ) : (
          <div className="card-luxury text-center py-12">
            <p className="text-xl text-muted-foreground">
              {searchQuery || filterYear || filterSchool
                ? "No alumni found matching your search"
                : "No alumni registered yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
