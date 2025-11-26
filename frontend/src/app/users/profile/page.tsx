"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateProfile } from "../action";
import Link from "next/link";


const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

function ProfileForm() {
  const { user, checkUserSession } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [state, formAction] = useActionState(updateProfile, {
    message: "",
    success: false,
    errors: undefined,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar || undefined);
  const [isEmailEdited, setIsEmailEdited] = useState<boolean>(false);

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
      checkUserSession();
    }
  }, [state.success, checkUserSession]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarPreview(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmailEdited(user?.email !== e.target.value);
  }

  if (!user) {
    return null;
  }

  const errors = state.errors || {};

  return (
    <Card className="w-full max-w-3xl shadow-xl border-t-4 border-emerald-600 rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-3xl font-bold">Hồ sơ cá nhân</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Quản lý thông tin cá nhân của bạn.
          </CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 size-4" /> Chỉnh sửa
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="mr-2 size-4" /> Hủy
          </Button>
        )}
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="space-y-8">
          {state.message && (
            <div className={`p-4 rounded-lg text-sm ${state.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {state.message}
            </div>
          )}

          <div className="pt-8">
            <div className="flex items-center space-x-6">
              <Avatar className="size-24 border-2 border-emerald-100">
                <AvatarImage src={avatarPreview || undefined} alt={user.username} />
                <AvatarFallback className="text-3xl">
                  {getInitials(user.first_name || user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label htmlFor="avatar" className="text-base font-semibold">Ảnh đại diện</Label>
                <Input 
                  id="avatar" 
                  name="avatar" 
                  type="text" 
                  className="text-base"
                  placeholder="https://example.com/image.png"
                  onChange={handleAvatarChange}
                  defaultValue={user.avatar || ""}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">Dán một link URL ảnh công khai.</p>
                {errors.avatar && <p className="text-sm text-destructive">{errors.avatar[0]}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">Username</Label>
              <Input id="username" name="username" defaultValue={user.username} disabled={!isEditing} className="text-base" />
              {errors.username && <p className="text-sm text-destructive">{errors.username[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input id="email" name="email" defaultValue={user.email} disabled={!isEditing} className="text-base" onChange={handleEmailChange}/>
              {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
            </div>
          </div>

          <div className="border-t border-emerald-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-base font-semibold">Họ</Label>
                <Input id="first_name" name="first_name" defaultValue={user.first_name || ""} disabled={!isEditing} className="text-base" />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-base font-semibold">Tên</Label>
                <Input id="last_name" name="last_name" defaultValue={user.last_name || ""} disabled={!isEditing} className="text-base" />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name[0]}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-base font-semibold">Số điện thoại</Label>
                <Input id="phone_number" name="phone_number" defaultValue={user.phone_number || ""} disabled={!isEditing} className="text-base" />
                {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold">Giới tính</Label>
                <Select name="gender" defaultValue={user.gender || ""} disabled={!isEditing}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-200 pt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-base font-semibold">Ngày sinh</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={user.date_of_birth || ""} disabled={!isEditing} className="text-base" />
              {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-semibold">Địa chỉ</Label>
              <Textarea id="address" name="address" defaultValue={user.address || ""} disabled={!isEditing} className="text-base" />
              {errors.address && <p className="text-sm text-destructive">{errors.address[0]}</p>}
            </div>
          </div>

          {isEditing && isEmailEdited && (
            <div className="p-3 rounded-md text-sm bg-yellow-50 text-yellow-800 border border-yellow-200">
              <strong>Lưu ý:</strong> Bạn đang thay đổi email. Sau khi lưu, bạn sẽ cần xác thực email mới để kích hoạt lại tài khoản.
            </div>
          )}

        </CardContent>
        {isEditing && (
          <CardFooter className="border-t border-gray-100 pt-6">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-base py-6 px-8">
              <Save className="mr-2 size-4" /> Lưu thay đổi
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}


export default function ProfilePage() {
  const { isLoading, user } = useAuth();

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-12 px-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="size-12 animate-spin text-emerald-600" />
        </div>
      ) : !user ? (
        <div className="container max-w-4xl mx-auto py-12 text-center">
          <Card className="p-8 shadow-lg">
            <CardTitle className="text-2xl">Lỗi</CardTitle>
            <CardDescription className="mt-2 text-lg">
              Bạn cần đăng nhập để xem trang này.
            </CardDescription>
            <Button asChild className="mt-6 bg-emerald-600 hover:bg-emerald-700">
              <Link href={"/auth/login"}>Đi đến trang Đăng nhập</Link>
            </Button>
          </Card>
        </div>
      ) : (
        <div className="container max-w-3xl mx-auto">
          <ProfileForm />
        </div>
      )}
    </div>
  );
}
