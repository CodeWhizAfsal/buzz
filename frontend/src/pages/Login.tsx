import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Component() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* <div className="hidden lg:block lg:w-1/2 bg-gray-800">
        <img
          src="/radio.png?height=1080&width=1080"
          alt="Chat illustration"
          className="object-cover w-full h-full"
        />
      </div> */}
      
      <div className="w-full flex items-center justify-center p-4 sm:p-8"> 
      {/* lg:w-1/2 */}
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-white">Buzz</CardTitle>
            <p className="text-sm text-center text-gray-400">Connect and chat securely</p>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full py-6 text-lg bg-gray-700 hover:bg-gray-600 hover:text-white-500 text-white rounded-xl"
              variant="outline"
              onClick={() => {
                window.location.href = import.meta.env.VITE_BACKEND_URL+'/auth/google';
                console.log("Continue with Google clicked")
              }}
            >
              <svg
                className="w-6 h-6 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}