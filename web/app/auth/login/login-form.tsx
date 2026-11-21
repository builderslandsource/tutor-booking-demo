"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Tutor login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
