import { redirect } from "next/navigation";

type ProjectPageProps = {
  params: { project: string };
};

export default function ProjectIndexPage({ params }: ProjectPageProps) {
  redirect(`/${params.project}/dashboard`);
}
