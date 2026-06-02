'use client'
import * as React from "react";
import {
  Logo,
  Alert,
  Modal,
  Avatar,
  InputField,
  PasswordInput,
  SocialLoginButton,
  AccountInfoCard,
  AccountInfoField,
  Badge,
} from "@/components/common";

export default function ComponentDemo() {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Top Nav */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" variant="full" />
          <h1 className="text-lg font-semibold text-foreground">
            Component Library
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Logo Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">Logo</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ Logo }"} from "@/components/common"
              </code>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Sizes</h3>
                <div className="flex flex-col gap-4 items-start">
                  <Logo size="sm" />
                  <Logo size="md" />
                  <Logo size="lg" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Variants</h3>
                <div className="flex flex-col gap-4 items-start">
                  <Logo size="md" variant="full" />
                  <Logo size="md" variant="icon-only" />
                </div>
              </div>
            </div>
          </section>

          {/* Alert Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">Alert</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ Alert }"} from "@/components/common"
              </code>
            </div>
            <div className="space-y-4">
              <Alert variant="info" title="Update available" message="A new version of the application is ready to install." />
              <Alert variant="success" title="Profile saved" message="Your profile information has been successfully updated." />
              <Alert variant="warning" title="Storage running low" message="You have used 90% of your storage quota." />
              <Alert variant="error" title="Connection error" message="Could not connect to the server. Please check your network." />
              <Alert 
                variant="info" 
                title="Dismissible alert" 
                message="Click the X on the right to dismiss this alert (demo only)." 
                onClose={() => alert('Close clicked!')}
              />
            </div>
          </section>

          {/* Modal Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">Modal</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ Modal }"} from "@/components/common"
              </code>
            </div>
            <div>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Open Demo Modal
              </button>
              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Edit Profile"
                footer={
                  <>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 sm:mr-2 mb-2 sm:mb-0"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Save changes
                    </button>
                  </>
                }
              >
                <div className="space-y-4 py-2">
                  <InputField label="Name" defaultValue="Nguyen Van A" />
                  <InputField label="Email" type="email" defaultValue="nguyenvana@company.vn" />
                </div>
              </Modal>
            </div>
          </section>

          {/* InputField Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">InputField</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ InputField }"} from "@/components/common"
              </code>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <InputField label="Default Input" placeholder="Type something..." />
              <InputField label="Required Input" required placeholder="This field is required" />
              <InputField 
                label="With Hint" 
                hint="Your password must be at least 8 characters." 
                placeholder="Enter password"
              />
              <InputField 
                label="With Error" 
                error="Please enter a valid email address." 
                defaultValue="invalid-email"
              />
              <InputField label="Disabled Input" disabled defaultValue="Cannot edit this" />
            </div>
          </section>

          {/* PasswordInput Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">PasswordInput</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ PasswordInput }"} from "@/components/common"
              </code>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <PasswordInput label="Password" placeholder="Enter your password" defaultValue="secret123" />
              <PasswordInput 
                label="Confirm Password" 
                error="Passwords do not match" 
                defaultValue="secret12" 
              />
            </div>
          </section>

          {/* SocialLoginButton Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">SocialLoginButton</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ SocialLoginButton }"} from "@/components/common"
              </code>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="facebook" />
              <SocialLoginButton provider="github" />
              <SocialLoginButton provider="google" loading />
            </div>
          </section>

          {/* Avatar Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">Avatar</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ Avatar }"} from "@/components/common"
              </code>
            </div>
            <div className="space-y-8">
              <div className="flex flex-wrap items-end gap-6">
                <Avatar size="xs" name="Nguyen Van A" />
                <Avatar size="sm" name="Nguyen Van A" />
                <Avatar size="md" name="Nguyen Van A" />
                <Avatar size="lg" name="Nguyen Van A" />
                <Avatar size="xl" name="Nguyen Van A" />
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <Avatar size="md" name="Nguyen Van A" />
                <Avatar size="md" name="Nguyen Van A" online />
                <Avatar size="md" name="Tran Thi B" />
                <Avatar size="md" name="Tran Thi B" online />
              </div>
            </div>
          </section>

          {/* AccountInfoCard Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">AccountInfoCard</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ AccountInfoCard }"} from "@/components/common"
              </code>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <AccountInfoCard 
                name="Nguyen Van A" 
                email="nguyenvana@company.vn" 
                role="Administrator"
                onEdit={() => alert('Edit clicked')}
              />
              <AccountInfoCard 
                name="Tran Thi B" 
                email="tranthib@company.vn" 
                role="Editor"
              />
            </div>
          </section>

          {/* AccountInfoField Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">AccountInfoField</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ AccountInfoField }"} from "@/components/common"
              </code>
            </div>
            <div className="max-w-xl border rounded-xl px-4 bg-card">
              <AccountInfoField label="Full Name" value="Nguyen Van A" editable onEdit={() => alert('Edit Name')} />
              <AccountInfoField label="Email Address" value="nguyenvana@company.vn" editable onEdit={() => alert('Edit Email')} />
              <AccountInfoField label="Phone Number" value="+84 90 123 4567" editable onEdit={() => alert('Edit Phone')} />
              <AccountInfoField label="Role" value="Administrator" />
            </div>
          </section>

          {/* Badge Section */}
          <section className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-2xl font-bold tracking-tight">Badge</h2>
              <code className="text-sm bg-muted text-muted-foreground px-1.5 py-0.5 rounded mt-2 inline-block">
                import {"{ Badge }"} from "@/components/common"
              </code>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant="default" label="Default" />
              <Badge variant="primary" label="Primary" />
              <Badge variant="success" label="Success" />
              <Badge variant="warning" label="Warning" />
              <Badge variant="danger" label="Danger" />
              <div className="w-full h-0"></div>
              <Badge size="sm" variant="primary" label="Small" />
              <Badge size="md" variant="primary" label="Medium" />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
