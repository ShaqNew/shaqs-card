export default function About() {
  return (
    <section
      data-testid="about"
      id="about"
      className="section-padding section-bg-white"
    >
      <div className="section-container">
        <h2 className="section-title">About Me</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-body mb-6 leading-relaxed">
              I&apos;m a passionate software engineer born and raised in London
              who loves solving complex problems and building products that make
              a difference.
            </p>
            <p className="text-lg text-body mb-6 leading-relaxed">
              I studied computer science at the University of Kent where I
              achieved a 1st. With expertise in web development, cloud
              architecture, and team leadership, I&apos;ve successfully
              delivered projects for both small and large companies. Companies
              that I’ve developer for include Calvin Klein, Tommy Hilfiger, and
              Tempur Mattress.
            </p>
            <p className="text-lg text-body mb-6 leading-relaxed">
              I believe in writing clean and maintainable code, helping my team
              through leadership, mentorship, or support, and sharing knowledge
              with others.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">5+</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Years Experience
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">15+</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Technologies
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 h-full flex flex-col justify-around">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="font-semibold text-heading mb-2">Education</h3>
              <p className="text-body">
                Computer Science, University of Kent -{" "}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  1st Class Honours
                </span>
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="font-semibold text-heading mb-2">
                Industry interests
              </h3>
              <p className="text-body">
                E-commerce, UX, Data handling, Machine Learning, Accessibility,
                Team Leadership
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="font-semibold text-heading mb-2">
                Casual interests
              </h3>
              <p className="text-body">
                Reading, Gaming, Movies, Music, Science, Psychology
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
