import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-blue-100 p-4">
            <FileSearch className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-nunito font-bold mb-3 text-slate-800">404</h1>
        <p className="text-xl text-slate-600 mb-6">
          We couldn't find the page you're looking for.
        </p>
        <Button asChild size="lg" className="font-medium space-x-2">
          <Link to="/">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
