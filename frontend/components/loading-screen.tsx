interface LoadingScreenProps {
  message: string
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
      <div className="text-center space-y-6 lg:space-y-8 animate-in fade-in-50 duration-500 w-full max-w-md lg:max-w-lg">
        {/* Loading Text */}
        <div className="space-y-2 lg:space-y-4">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-slate-700">{message}</h2>
        </div>
      </div>
    </div>
  )
}
