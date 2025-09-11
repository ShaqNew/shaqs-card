import Image from "next/image";
import logogram from "@/lib/images/logogram-hydCrl.png";

export default function Hero() {
  return (
    <section data-testid="hero" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="section-container text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 p-1">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
              <Image
                src={logogram}
                alt="logogram"
                width={1000}
                height={1000}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <h1
          id="hero-heading"
          className="text-4xl sm:text-6xl font-bold text-heading mb-6"
        >
          Shaq Newell
        </h1>
        <p className="text-xl sm:text-2xl text-body mb-8 max-w-3xl mx-auto">
          Senior Software Engineer with 5+ years of experience building scalable
          applications, leading development teams, and delivering{" "}
          <span className="text-accent">exceptional</span> user experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contact" className="btn-primary">
            Get In Touch
          </a>
          <a href="#projects" className="btn-secondary">
            View My Work
          </a>
          <a href="https://shaqs-sandbox.vercel.app/" className="btn-secondary">
            Visit my Sandbox
          </a>
        </div>
      </div>
    </section>
  );
}
