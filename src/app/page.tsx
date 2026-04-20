import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

export default function Dashboard() {
  const pages = [
    {
      title: "Conditioning of Matrix I",
      description: "Understand how the pointwise condition number of A varies based on the input vector x.",
      href: "/pointwise-conditioning",
      implemented: true,
    },
    {
      title: "Conditioning of Matrix II",
      description: "Visualize matrix perturbation geometry and deduced worst-case amplification.",
      href: "/conditioning-matrix-2",
      implemented: true,
    },
    {
      title: "Conditioning of LSE I",
      description: "Understand the geometry of the normal equations projection and how b is projected onto the plane defined by A.",
      href: "/lse-stability",
      implemented: true,
    },
    {
      title: "Conditioning of LSE II (Under Construction)",
      description: "Sensitivity of the least squares solution to matrix perturbations.",
      href: "/lse-stability-2",
      implemented: true,
    },
    {
      title: "Classical Gram-Schmidt",
      description: "Visualize orthogonalization using standard projections.",
      href: "/four-qrs/cgs",
      implemented: true,
    },
    {
      title: "Modified Gram-Schmidt",
      description: "Visualize numerically stable orthogonalization.",
      href: "/four-qrs/mgs",
      implemented: true,
    },
    {
      title: "Householder Reflections",
      description: "Visualize QR factorization using Householder reflections in 3D.",
      href: "/four-qrs/householder",
      implemented: true,
    },
    {
      title: "Givens Rotations",
      description: "Visualize QR factorization using Givens rotations in 3D.",
      href: "/four-qrs/givens",
      implemented: true,
    },
    {
      title: "SVD vs Eigenvalue",
      description: "Comparing geometric perspectives of matrix decomposition.",
      href: "/svd-vs-eigen",
      implemented: true,
    },
    {
      title: "SVD Computation",
      description: "Elementwise view of how the SVD constructs a transformed vector.",
      href: "/svd-computation",
      implemented: true,
    },
    {
      title: "Eigenvalues Solver",
      description: "Full end-to-end QR iteration algorithm for finding eigenvalues.",
      href: "/eigen-solver",
      implemented: true,
    },
    {
      title: "Bulge Chasing",
      description: "Step-by-step implicit QR iteration tracking the matrix bulge.",
      href: "/bulge-chasing",
      implemented: true,
    },
    {
      title: "Batch Rotations",
      description: "Step-by-step explicit QR iteration forming R and RQ.",
      href: "/batch-rotations",
      implemented: true,
    },
    {
      title: "Other NLA Topics",
      description: "Krylov subspace methods and more. (Coming soon)",
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
