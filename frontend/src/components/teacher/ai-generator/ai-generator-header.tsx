import { Zap } from 'lucide-react';

export function AIGeneratorHeader() {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-6 text-white">
      <div className="flex items-start gap-4">
        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
          <p className="mt-2 opacity-90">
            Generate quizzes automatically using AI. Upload study materials or paste content to create
            custom quizzes in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}


