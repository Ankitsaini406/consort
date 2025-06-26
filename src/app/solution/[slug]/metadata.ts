import { getSolutionBySlug } from "./action";

type Props = {
    params: { slug: string };
}; 

export async function generateMetadata({ params }: Props) {
    const solution = await getSolutionBySlug(params.slug);

    return {
        title: solution?.solutionName ?? "Solution Not Found",
        description: solution?.description ?? "",
    };
}
