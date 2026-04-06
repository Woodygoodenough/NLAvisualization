import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

export default function Dashboard() {
  const pages = [
    {
      title: "LSE Stability I",
      description: "Understand the geometry of the normal equations projection and how b is projected onto the plane defined by A.",
      href: "/lse-stability",
      implemented: true,
    },
    {
      title: "LSE Stability II",
      description: "Understand the sensitivity of the projection ŷ to perturbations in the matrix A.",
      href: "/lse-stability-2",
      implemented: true,
    },
    {
      title: "LSE Stability III",
      description: "Conditioning and sensitivity analysis of matrix factorizations. (Coming soon)",
      href: "#",
      implemented: false,
    },
    {
      title: "LSE Stability IV",
      description: "Advanced perturbations in numerical linear algebra. (Coming soon)",
      href: "#",
      implemented: false,
    },
    {
      title: "More NLA Topics",
      description: "Eigenvalue sensitivities, SVD, and Krylov subspace methods. (Coming soon)",
      href: "#",
      implemented: false,
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">NLA Visualization</h1>
        <p className="text-slate-500 text-lg">
          Explorable explanations for Numerical Linear Algebra. Geometry first.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page, i) => (
          <Link key={i} href={page.href} className={page.implemented ? "cursor-pointer block h-full" : "cursor-not-allowed block h-full"}>
            <Card className={`h-full transition-all duration-200 flex flex-col ${
              page.implemented
                ? "hover:border-slate-400 hover:shadow-md border-slate-200"
                : "opacity-60 bg-slate-50/50 border-slate-100"
            }`}>
              <CardHeader className="flex-1">
                <CardTitle className="flex items-center justify-between">
                  {page.title}
                  {!page.implemented && <Lock size={16} className="text-slate-400" />}
                </CardTitle>
                <CardDescription className="pt-2 leading-relaxed">
                  {page.description}
                </CardDescription>
              </CardHeader>
              {page.implemented && (
                <CardContent className="pb-4 pt-0">
                  <div className="flex items-center text-sm font-medium text-blue-600">
                    Explore visualization <ArrowRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
