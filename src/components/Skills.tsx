// import styled, { css } from "@emotion/styled";
import tw from "tailwind-styled-components";

const SkillCard = tw.div`
  card overflow-y-scroll lg:overflow-scroll h-full md:h-auto sm:h-auto
`;

const SkillGrid = tw.div`
  grid md:grid-cols-3 gap-8 lg:h-60 md:h-auto sm:h-auto
`;

export default function Skills() {
  return (
    <section id="skills" className="section-padding">
      <div className="section-container">
        <h2 className="section-title">Technical Skills</h2>
        <SkillGrid>
          <SkillCard className="card">
            <h3 className="text-xl font-semibold text-heading mb-4 text-center">
              Frontend
            </h3>
            <div className="space-y-2">
              <div className="flex justify-around">
                <span className="text-body">React/Next.js</span>
                {/* <span className="text-accent font-medium">Advanced</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">TypeScript</span>
                {/* <span className="text-accent font-medium">Advanced</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">Tailwind/CSS/Sass</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Unit testing</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">E2E testing</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">React Native</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Vue.js</span>
                {/* <span className="text-accent font-medium">Adept</span> */}
              </div>
            </div>
          </SkillCard>

          <SkillCard className="card">
            <h3 className="text-xl font-semibold text-heading mb-4 text-center">
              Backend
            </h3>
            <div className="space-y-2">
              <div className="flex justify-around">
                <span className="text-body">Node.js</span>
                {/* <span className="text-accent font-medium">Adept</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">Python</span>
                {/* <span className="text-accent font-medium">Competent</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">PostgreSQL/MySQL</span>
                {/* <span className="text-accent font-medium">Competent</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">GraphQL</span>
                {/* <span className="text-accent font-medium">Advanced</span> */}
              </div>
            </div>
          </SkillCard>

          <SkillCard className="card">
            <h3 className="text-xl font-semibold text-heading mb-4 text-center">
              DevOps, Cloud & Services
            </h3>
            <div className="space-y-2">
              <div className="flex justify-around">
                <span className="text-body">AWS</span>
                {/* <span className="text-accent font-medium">Expert</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">Vercel</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Docker</span>
                {/* <span className="text-accent font-medium">Advanced</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">Sentry</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Strapi</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Salesforce</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Cloudinary</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Kubernetes</span>
                {/* <span className="text-accent font-medium">Advanced</span> */}
              </div>
              <div className="flex justify-around">
                <span className="text-body">Magento</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">Azure</span>
              </div>
              <div className="flex justify-around">
                <span className="text-body">CI/CD</span>
                {/* <span className="text-accent font-medium">Expert</span> */}
              </div>
            </div>
          </SkillCard>
        </SkillGrid>
      </div>
    </section>
  );
}
