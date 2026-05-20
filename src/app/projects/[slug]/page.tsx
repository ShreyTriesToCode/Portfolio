import ProjectCaseStudy from "./project-case-study";

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectCaseStudy slug={slug} />;
}
