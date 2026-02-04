"use client";

export default function SuccessStories() {
  const stories = [
    {
      name: "Sarah",
      testimonial:
        "Met through a game, now dating for 6 months! The AI suggestions helped me break the ice perfectly.",
      image:
        "/SaveClip.App_465938944_18038279744183449_289895478816436559_n.jpg",
      tag: "Dating 2 Day",
    },
    {
      name: "Rudra",
      testimonial:
        "This made dating fun again! No pressure, just genuine conversations while playing a simple game.",
      image: "/ind.avif",
      tag: "Genuine Connections",
    },
    {
      name: "Anuman",
      testimonial:
        "The voice message feature is amazing! It's so much more personal than just text. Found my match here! ❤️",
      image: "/men.jfif",
      tag: "Found a Match",
    },
  ];

  return (
    // Background updated to match theme (#fdf2f8)
    <section className="py-20 px-6 bg-[#fdf2f8]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Real people, real connections made through play.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="bg-white rounded-[40px] p-8 shadow-xl shadow-pink-200/30 border border-white flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300"
            >
              {/* Profile Image - Themed border */}
              <div className="w-24 h-24 mb-6 relative">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-full object-cover rounded-full border-4 border-pink-100 shadow-md"
                />
              </div>

              {/* Tag - Themed colors */}
              <span className="bg-pink-50 text-pink-500 text-[10px] font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-[0.1em]">
                {story.tag}
              </span>

              {/* Content */}
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {story.name}
              </h3>
              <p className="text-gray-600 leading-relaxed italic text-sm md:text-base">
                "{story.testimonial}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
