import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function Superlatives() {
  const { data: superlatives, isLoading } = trpc.superlatives.getSuperlatives.useQuery();
  const [selectedSuperlative, setSelectedSuperlative] = useState<number | null>(null);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [showNomineeList, setShowNomineeList] = useState(false);

  const { data: votes } = trpc.superlatives.getVotes.useQuery(
    { superlativeId: selectedSuperlative || 0 },
    { enabled: !!selectedSuperlative }
  );

  const { data: alumni } = trpc.directory.getAllAlumni.useQuery({
    limit: 100,
    offset: 0,
  });

  const voteMutation = trpc.superlatives.voteForSuperlative.useMutation({
    onSuccess: () => {
      toast.success("Vote recorded!");
      setShowNomineeList(false);
      setVotingFor(null);
    },
  });

  const handleVote = (superlativeId: number, votedForUserId: number) => {
    voteMutation.mutate({
      superlativeId,
      votedForUserId,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="text-primary" size={40} />
            Class Superlatives
            <Trophy className="text-primary" size={40} />
          </h1>
          <div className="art-deco-line mx-auto w-48 mb-6"></div>
          <p className="text-xl text-muted-foreground">
            Vote for your classmates in fun categories and celebrate what makes your class unique!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : superlatives && superlatives.length > 0 ? (
          <div className="space-y-8">
            {superlatives.map((superlative) => (
              <div key={superlative.id} className="card-luxury art-deco-frame">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">
                      {superlative.title}
                    </h2>
                    {superlative.description && (
                      <p className="text-muted-foreground">{superlative.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setSelectedSuperlative(
                        selectedSuperlative === superlative.id ? null : superlative.id
                      )
                    }
                    className="text-primary hover:text-accent transition-colors"
                  >
                    {selectedSuperlative === superlative.id ? "Hide" : "View"} Votes
                  </button>
                </div>

                {/* Votes Display */}
                {selectedSuperlative === superlative.id && votes && votes.length > 0 && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-bold mb-3">Current Votes:</h3>
                    <div className="space-y-2">
                      {votes.map((vote: any) => (
                        <div key={vote.id} className="flex items-center justify-between">
                          <span className="font-semibold">
                            {vote.votedForUser?.name || "Anonymous"}
                          </span>
                          <span className="text-primary font-bold">👑</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vote Button */}
                {showNomineeList && votingFor === superlative.id ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {alumni?.map((person: any) => (
                      <button
                        key={person.id}
                        onClick={() => handleVote(superlative.id, person.id)}
                        className="w-full p-2 text-left hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                      >
                        {person.profilePhotoUrl && (
                          <img
                            src={person.profilePhotoUrl}
                            alt={person.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="font-semibold">{person.name || "Anonymous"}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setVotingFor(superlative.id);
                      setShowNomineeList(true);
                    }}
                    className="w-full btn-luxury"
                  >
                    Vote Now
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-luxury text-center py-12">
            <p className="text-xl text-muted-foreground">
              No superlatives available yet. Check back soon! 🎓
            </p>
          </div>
        )}

        {/* Featured Superlatives Section */}
        <div className="mt-16 pt-8 border-t-2 border-primary">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Suggested Superlatives Categories
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Most Likely To Become CEO",
              "Most Likely To Change The World",
              "Best Sense of Humor",
              "Most Likely To Win An Oscar",
              "Most Likely To Travel The World",
              "Best Dressed",
              "Most Likely To Start A Business",
              "Most Likely To Become Famous",
            ].map((category, idx) => (
              <div key={idx} className="card-luxury art-deco-frame text-center">
                <p className="text-lg font-semibold mb-4">{category}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Vote for your classmate who fits this category best!
                </p>
                <Button className="w-full btn-luxury" disabled>
                  Coming Soon
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
