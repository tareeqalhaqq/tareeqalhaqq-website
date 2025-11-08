import { ContactForm } from "@/components/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight text-center font-headline lg:text-5xl mb-12">
        Contact Us
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg">
                    <div className="flex items-start">
                        <MapPin className="h-6 w-6 mr-4 mt-1 text-primary" />
                        <span>123 Spiritual Path, Knowledge City, 12345</span>
                    </div>
                     <div className="flex items-center">
                        <Mail className="h-6 w-6 mr-4 text-primary" />
                        <a href="mailto:contact@rahmaniyyah.com" className="hover:text-primary">contact@rahmaniyyah.com</a>
                    </div>
                     <div className="flex items-center">
                        <Phone className="h-6 w-6 mr-4 text-primary" />
                        <span>(123) 456-7890</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Visiting Hours</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Daily: 9:00 AM - 9:00 PM</p>
                    <p>Jumu'ah Prayer: 1:00 PM</p>
                    <p className="mt-4 text-sm text-muted-foreground">Please call ahead for special events or holidays.</p>
                </CardContent>
            </Card>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
