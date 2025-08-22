export default function Experience() {
  return (
    <section id="experience" className="section-padding section-bg-white">
      <div className="section-container">
        <h2 className="section-title">Professional Experience</h2>
        <div className="space-y-8">
          <div className="border-l-4 border-blue-600 pl-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="text-xl font-semibold text-heading">
                Senior Software Engineer
              </h3>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                2022 - Present
              </span>
            </div>
            <div className="text-accent font-medium mb-2">TechCorp Inc.</div>
            <p className="text-body mb-3">
              Lead development of microservices architecture, mentored junior
              developers, and improved system performance by 40%.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="tag">React</span>
              <span className="tag">Node.js</span>
              <span className="tag">AWS</span>
            </div>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="text-xl font-semibold text-heading">
                Full Stack Developer
              </h3>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                2020 - 2022
              </span>
            </div>
            <div className="text-accent font-medium mb-2">StartupXYZ</div>
            <p className="text-body mb-3">
              Built and deployed customer-facing applications, implemented CI/CD
              pipelines, and collaborated with cross-functional teams.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="tag">Vue.js</span>
              <span className="tag">Python</span>
              <span className="tag">PostgreSQL</span>
            </div>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h3 className="text-xl font-semibold text-heading">
                Software Engineer
              </h3>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                2018 - 2020
              </span>
            </div>
            <div className="text-accent font-medium mb-2">
              Enterprise Solutions
            </div>
            <p className="text-body mb-3">
              Developed enterprise applications, worked with legacy systems, and
              participated in code reviews and technical planning.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="tag">Java</span>
              <span className="tag">Spring</span>
              <span className="tag">Oracle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
