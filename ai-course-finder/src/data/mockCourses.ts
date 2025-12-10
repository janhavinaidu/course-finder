interface Course {
  id: number;
  name: string;
  provider: string;
  level: "beginner" | "intermediate" | "advanced";
  pricing: "free" | "paid";
  description: string;
  url: string;
  keywords: string[];
}

export const mockCourses: Course[] = [
  {
    id: 1,
    name: "Generative AI for Everyone",
    provider: "DeepLearning.AI",
    level: "beginner",
    pricing: "free",
    description: "Learn the fundamentals of generative AI and how to use it effectively in your work and daily life.",
    url: "https://www.deeplearning.ai",
    keywords: ["genai", "generative ai", "ai", "llm", "chatgpt"],
  },
  {
    id: 2,
    name: "MLOps Specialization",
    provider: "Google Cloud",
    level: "intermediate",
    pricing: "paid",
    description: "Master the skills needed to deploy, monitor, and maintain ML models in production environments.",
    url: "https://cloud.google.com",
    keywords: ["mlops", "machine learning", "ml", "devops", "deployment"],
  },
  {
    id: 3,
    name: "Introduction to Web3 Development",
    provider: "Chainlink Labs",
    level: "beginner",
    pricing: "free",
    description: "Build decentralized applications on blockchain with hands-on projects and real-world examples.",
    url: "https://chain.link",
    keywords: ["web3", "blockchain", "crypto", "ethereum", "solidity"],
  },
  {
    id: 4,
    name: "Advanced Prompt Engineering",
    provider: "OpenAI",
    level: "advanced",
    pricing: "free",
    description: "Master the art of crafting effective prompts for large language models to maximize AI capabilities.",
    url: "https://openai.com",
    keywords: ["genai", "prompt", "ai", "llm", "chatgpt", "gpt"],
  },
  {
    id: 5,
    name: "Full Stack Web3 Bootcamp",
    provider: "Alchemy University",
    level: "intermediate",
    pricing: "free",
    description: "Comprehensive training on building full-stack decentralized applications from scratch.",
    url: "https://university.alchemy.com",
    keywords: ["web3", "blockchain", "fullstack", "dapp", "ethereum"],
  },
  {
    id: 6,
    name: "Machine Learning Engineering for Production",
    provider: "Coursera",
    level: "advanced",
    pricing: "paid",
    description: "Learn to design and deploy scalable ML pipelines with industry best practices and tools.",
    url: "https://coursera.org",
    keywords: ["mlops", "ml", "production", "deployment", "tensorflow"],
  },
  {
    id: 7,
    name: "Building LLM-Powered Applications",
    provider: "Hugging Face",
    level: "intermediate",
    pricing: "free",
    description: "Create powerful applications using large language models with practical coding exercises.",
    url: "https://huggingface.co",
    keywords: ["genai", "llm", "ai", "nlp", "transformers"],
  },
  {
    id: 8,
    name: "Smart Contract Security",
    provider: "ConsenSys Academy",
    level: "advanced",
    pricing: "paid",
    description: "Deep dive into security patterns and vulnerability prevention for blockchain smart contracts.",
    url: "https://consensys.net",
    keywords: ["web3", "security", "blockchain", "solidity", "audit"],
  },
  {
    id: 9,
    name: "Data Engineering on Cloud",
    provider: "AWS",
    level: "intermediate",
    pricing: "paid",
    description: "Build robust data pipelines and analytics solutions using cloud-native services and tools.",
    url: "https://aws.amazon.com",
    keywords: ["data", "cloud", "aws", "pipeline", "analytics"],
  },
];

export const getCourses = (query: string): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const searchTerms = query.toLowerCase().split(" ");
      const results = mockCourses.filter((course) =>
        searchTerms.some(
          (term) =>
            course.keywords.some((keyword) => keyword.includes(term)) ||
            course.name.toLowerCase().includes(term) ||
            course.provider.toLowerCase().includes(term)
        )
      );
      resolve(results.length > 0 ? results : mockCourses.slice(0, 6));
    }, 800);
  });
};
