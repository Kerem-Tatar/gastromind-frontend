"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { API_URL } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function SuperAdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.status === "success") {
                localStorage.setItem("admin_token", data.token);
                router.push("/superadmin");
            } else {
                setError("Giriş başarısız: " + data.error);
            }
        } catch (err) {
            setError("Sunucuya bağlanılamadı.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[var(--color-brand)]/15 text-[var(--color-brand)] flex items-center justify-center">
                        <Wrench size={20} />
                    </div>
                    <h1 className="text-xl font-semibold text-[var(--color-text)]">Superadmin Girişi</h1>
                    <p className="text-[var(--color-text-muted)] text-sm">GastroMind Platform Yönetimi</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[var(--color-text-muted)] text-sm block mb-1">Kullanıcı Adı</label>
                        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full" />
                    </div>
                    <div>
                        <label className="text-[var(--color-text-muted)] text-sm block mb-1">Şifre</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />
                    </div>

                    {error && <div className="text-[var(--color-danger)] text-sm text-center">{error}</div>}

                    <Button type="submit" variant="primary" size="lg" className="w-full">
                        Giriş Yap
                    </Button>
                </form>
            </Card>
        </div>
    );
}
