import { ArrowRightIcon, BookIcon, FileQuestionIcon, FileTextIcon } from "./icons";

const categories = [
  {
    name: "Notes",
    bg: "bg-accent-mint",
    fg: "text-accent-mint-foreground",
    icon: <FileTextIcon />,
  },
  {
    name: "PYQs",
    bg: "bg-accent-coral",
    fg: "text-accent-coral-foreground",
    icon: <FileQuestionIcon />,
  },
  {
    name: "Syllabus",
    bg: "bg-accent-purple",
    fg: "text-accent-purple-foreground",
    icon: <BookIcon />,
  },
];

const newItems = [
  {
    title: "New Notes Added",
    subtitle: "Computer Networks - Unit 3",
    bg: "bg-accent-coral",
    fg: "text-accent-coral-foreground",
  },
  {
    title: "Exam Schedule",
    subtitle: "End Term Dates Announced",
    bg: "bg-accent-sky",
    fg: "text-accent-sky-foreground",
  },
  {
    title: "Result Out",
    subtitle: "Mid Term Results Declared",
    bg: "bg-primary",
    fg: "text-primary-foreground",
  },
  {
    title: "Holiday List",
    subtitle: "Upcoming Holidays 2025",
    bg: "bg-accent-mint",
    fg: "text-accent-mint-foreground",
  },
];

export function ExploreDiscoverSection() {
  return (
    <>
      {/* Categories Icons */}
      <div className="relative mx-auto mb-20 max-w-5xl">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="group flex cursor-pointer flex-col items-center gap-3"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full shadow-soft-md transition-all group-hover:-translate-y-1 group-hover:shadow-soft-lg md:h-20 md:w-20 ${cat.bg} ${cat.fg}`}
              >
                {cat.icon}
              </div>
              <span className="text-sm font-bold md:text-base">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* "See what's new" Section */}
      <div className="relative mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-black">See what&apos;s new</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {newItems.map((item, index) => (
            <div
              key={index}
              className={`relative flex h-64 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-6 shadow-soft-md transition-all hover:-translate-y-1 hover:shadow-soft-lg ${item.bg} ${item.fg}`}
            >
              <div className="z-10">
                <h3 className="mb-2 text-2xl leading-tight font-black">
                  {item.title}
                </h3>
                <p className="font-bold opacity-80">{item.subtitle}</p>
              </div>

              <div className="z-10 mt-auto self-start rounded-full bg-card/90 p-2 text-foreground shadow-soft-sm backdrop-blur-sm">
                <ArrowRightIcon className="h-5 w-5" />
              </div>

              {/* Decorative Circle */}
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white opacity-20"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
