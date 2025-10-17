import BlogForm from "@/components/blogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBlog } from "../actions";

export default function NewBlogPage() {
  return (
    <Card>
      <CardHeader><CardTitle>New Post</CardTitle></CardHeader>
      <CardContent>
        <BlogForm submitText="Create" onSubmit={createBlog} />
      </CardContent>
    </Card>
  );
}
