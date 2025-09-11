import Image from "next/image";
import tw from "tailwind-styled-components";
import MeetingPoint from "@/lib/images/MeetingPointScreenshot.png";
import CalvinKlein from "@/lib/images/CK_Page.png";
import TommyHilfiger from "@/lib/images/TH_Page.png";
import Tempur from "@/lib/images/Tempur_Page.png";
import Velo from "@/lib/images/Velo_Page.png";
import Xtreme from "@/lib/images/Xtreme_Page.png";
import MeloCare from "@/lib/images/MeloCare_Page.png";
import Sandbox from "@/lib/images/Sandbox_Page.png";

const ProjectGrid = tw.div`
grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-scroll
`;

const ProjectCardImage = tw.a`
h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-all duration-200
`;

const ProjectCardHeading = tw.h3`
text-xl font-semibold text-heading mb-2
`;

export default function Projects() {
  return (
    <section data-testid="projects" id="projects" className="section-padding">
      <div className="section-container">
        <h2 className="section-title">Past Projects and Work</h2>
        <ProjectGrid>
          <div className="card">
            <ProjectCardImage href="https://melo-next.vercel.app/">
              <Image src={MeloCare} alt="MeloCare" width={1000} height={1000} />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>MeloCare</ProjectCardHeading>
              <p className="text-body mb-4">
                A healthcare service provider website that I&apos;m currently
                developing for a client. It is a work in progress and currently
                hosted on a Vercel subdomain.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://shaqs-sandbox.vercel.app/">
              <Image src={Sandbox} alt="Sandbox" width={1000} height={1000} />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Sandbox</ProjectCardHeading>
              <p className="text-body mb-4">
                This is my sandbox website which I use to practice my skills and
                learn new technologies. It&apos;s experimental and not a
                production website.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://www.xtreme.game/">
              <Image src={Xtreme} alt="Xtreme" width={1000} height={1000} />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Xtreme</ProjectCardHeading>
              <p className="text-body mb-4">
                An iGaming and sports betting website. I worked on this project
                alongside a senior Frontend developer as we maintained and
                updated the website with new features and functionality.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://www.velo.com/">
              <Image src={Velo} alt="Velo" width={1000} height={1000} />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Velo</ProjectCardHeading>
              <p className="text-body mb-4">
                An e-commerce website for BAT (British American Tobacco) that I
                worked on alongside a senior Frontend developer as we maintained
                and updated the website with new features and functionality.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://uk.tempur.com/">
              <Image src={Tempur} alt="Tempur" width={1000} height={1000} />
            </ProjectCardImage>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-heading mb-2">
                Tempur
              </h3>
              <p className="text-body mb-4">
                Tempur Mattress&apos;s e-commerce website that I worked on
                during my time at an e-commerce agency.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://uk.tommy.com/">
              <Image
                src={TommyHilfiger}
                alt="Tommy Hilfiger"
                width={1000}
                height={1000}
              />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Tommy Hilfiger</ProjectCardHeading>
              <p className="text-body mb-4">
                Tommy Hilfiger&apos;s e-commerce website that I worked on during
                my time at an e-commerce agency.
              </p>
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://www.calvinklein.co.uk/">
              <Image
                src={CalvinKlein}
                alt="Calvin Klein"
                width={1000}
                height={1000}
              />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Calvin Klein</ProjectCardHeading>
              <p className="text-body mb-4">
                A Calvin Klein&apos;s e-commerce website that I worked on during
                my time at an e-commerce agency.
              </p>
              {/* <div className="flex flex-wrap gap-2 mb-4">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Node.js</span>
                <span className="tech-tag">SASS/BEM</span>
              </div> */}
            </div>
          </div>

          <div className="card">
            <ProjectCardImage href="https://youtu.be/F0l-N0IqgZ4">
              <Image
                src={MeetingPoint}
                alt="Meeting Point Video"
                width={1000}
                height={1000}
              />
            </ProjectCardImage>
            <div className="p-6">
              <ProjectCardHeading>Meeting Point Demo</ProjectCardHeading>
              <p className="text-body mb-4">
                I created this app with friends for our final year project at
                university with React Native for mobile and Vue.js for the web.
              </p>
            </div>
          </div>

          {/* <div className="card overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                Task Management App
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-heading mb-2">
                Task Management App
              </h3>
              <p className="text-body mb-4">
                Collaborative task management tool with real-time updates, team
                collaboration, and analytics.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tech-tag">Vue.js</span>
                <span className="tech-tag">Python</span>
                <span className="tech-tag">Socket.io</span>
              </div>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="text-accent hover:text-blue-700 text-sm font-medium"
                >
                  Live Demo
                </a>
                <a
                  href="#"
                  className="text-accent hover:text-blue-700 text-sm font-medium"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                ML Dashboard
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-heading mb-2">
                ML Dashboard
              </h3>
              <p className="text-body mb-4">
                Machine learning model monitoring dashboard with real-time
                predictions and performance metrics.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Python</span>
                <span className="tech-tag">TensorFlow</span>
              </div>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="text-accent hover:text-blue-700 text-sm font-medium"
                >
                  Live Demo
                </a>
                <a
                  href="#"
                  className="text-accent hover:text-blue-700 text-sm font-medium"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div> */}
        </ProjectGrid>
      </div>
    </section>
  );
}
