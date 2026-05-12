import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";
import { InlineMath } from "react-katex";
import React from "react";

export default function Dashboard() {
  const groups = [
    {
      name: "Basics",
      pages: [
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
      ]
    },
    {
      name: "Gram-Schmidt Algorithms",
      pages: [
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
      ]
    },
    {
      name: "Conditioning Analyses",
      pages: [
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
      ]
    },
    {
      name: "Iterative Methods",
      pages: [
        {
          title: "1. Power Iteration — Dominant Eigenvector",
          description: "Visualizing how a vector converges to the dominant eigenvector.",
          href: "/power-iteration",
          implemented: true,
        },
        {
          title: <span>2. Power Iteration — Spectral Decay (<InlineMath math="\\rho(A)<1" />)</span>,
          description: "Visualizing how a vector shrinks toward the origin when the spectral radius is less than 1.",
          href: "/power-iteration-decay",
          implemented: true,
        },
        {
          title: "3. Stationary Iterative Methods",
          description: "Visualizing the iterative process and error decay in solving Ax=b using matrix splitting.",
          href: "/stationary-iteration",
          implemented: true,
        },
        {
          title: "4. Arnoldi Iteration",
          description: "Visualizing the expansion of the Krylov subspace block by block.",
          href: "/arnoldi-iteration",
          implemented: true,
        },
        {
          title: "5. Conjugate Gradient",
          description: "Visualizing why CG finishes in n steps while GD zig-zags on an SPD matrix.",
          href: "/conjugate-gradient",
          implemented: true,
        },
        {
          title: "6. Batch Rotations",
          description: "Step-by-step explicit QR iteration forming R and RQ.",
          href: "/batch-rotations",
          implemented: true,
        },
        {
          title: "7. Bulge Chasing",
          description: "Step-by-step implicit QR iteration tracking the matrix bulge.",
          href: "/bulge-chasing",
          implemented: true,
        },
        {
          title: "8. Implicit Q Theorem",
          description: "Visualizing why Bulge Chasing is equivalent to Explicit QR.",
          href: "/implicit-q-theorem",
          implemented: true,
        },
        {
          title: "9. Eigen Solver",
          description: "Full end-to-end QR iteration algorithm for finding eigenvalues.",
          href: "/eigen-solver",
          implemented: true,
        },
      ]
    },
    {
      name: "Temporary Catch-ALL",
      pages: [
        {
          title: "Cholesky Stability",
          description: "Visualizing why Cholesky Factorization on SPD matrices doesn't need pivoting.",
          href: "/cholesky/stability",
          implemented: true,
        },
        {
          title: "Other NLA Topics",
          description: "Krylov subspace methods and more. (Coming soon)",
          href: "#",
          implemented: false,
        },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">NLA Visualization</h1>
        <p className="text-slate-500 text-lg">
          Explorable explanations for Numerical Linear Algebra. Geometry first.
        </p>
      </div>

      <div className="space-y-12">
        {groups.map((group, gIdx) => (
          <div key={gIdx}>
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-800">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.pages.map((page, i) => (
                <Link key={i} href={page.href} className={page.implemented ? "cursor-pointer block h-full" : "cursor-not-allowed block h-full"}>
                  <Card className={`h-full transition-all duration-200 flex flex-col ${
                    page.implemented
                      ? "hover:border-slate-400 hover:shadow-md border-slate-200"
                      : "opacity-60 bg-slate-50/50 border-slate-100"
                  }`}>
                    <CardHeader className="flex-1">
                      <CardTitle className="flex items-center justify-between text-lg leading-tight">
                        <span>{page.title}</span>
                        {!page.implemented && <Lock size={16} className="text-slate-400 flex-shrink-0 ml-2" />}
                      </CardTitle>
                      <CardDescription className="pt-2 leading-relaxed">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    {page.implemented && (
                      <CardContent className="pb-4 pt-0 mt-auto">
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
        ))}
      </div>
    </div>
  );
}
