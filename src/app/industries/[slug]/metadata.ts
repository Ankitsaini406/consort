import { getPostBySlug } from "./action";

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
    const post = await getPostBySlug(params.slug);

    return {
        title: post?.postTitle ?? "Blog Not Found",
        description: post?.headline ?? "",  
    };
}
