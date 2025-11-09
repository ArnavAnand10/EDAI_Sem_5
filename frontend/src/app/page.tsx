'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SkillForge</h1>
            </div>
            <div className="flex space-x-3">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Create Admin Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Simple Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Employee Skill Management System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage employee skills, track progress, and approve skill requests.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  Manage employee profiles and skill sets
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Award className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Skill Requests</CardTitle>
                <CardDescription>
                  Request new skills and get admin approval
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Track skill development and approvals
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Test Credentials */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Test Credentials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Email: admin@example.com</p>
                  <p className="text-sm text-gray-600">Password: admin123</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employee Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Email: john.doe@example.com</p>
                  <p className="text-sm text-gray-600">Password: employee123</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 SkillForge - Employee Skill Management System</p>
        </div>
      </footer>
    </div>
  );
}
