import { Sparkles, Cloud, BarChart3, Monitor, Zap, ShieldCheck } from "lucide-react";
import React from "react";

export interface ProductConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: "NewApi" | "Cloud" | "BarChart3" | "Monitor" | "Zap" | "ShieldCheck";
  image: string;
  hoverImage?: string;
  color: string;
  link: string;
  sortOrder: number; // For sorting
}

export const PRODUCTS_CONFIG: ProductConfig[] = [
  {
    id: "1",
    title: "New API",
    tagline: "人工智能应用基座 · AI 模型中转站",
    description: "TokenPlus 提供最稳定的 New API 中转服务，承载所有 AI 应用，管理你的数字资产，连接未来的统一基础设施平台。支持快速部署与弹性扩展。",
    iconName: "NewApi",
    image: "https://i.ibb.co/pTCv4NR/89200172-09c2-4d82-9260-2aaa2eac19fd.jpg",
    hoverImage: "https://i.ibb.co/pTCv4NR/89200172-09c2-4d82-9260-2aaa2eac19fd.jpg",
    color: "#8b5cf6",
    link: "https://www.newapi.ai/zh",
    sortOrder: 1,
  },
  {
    id: "2",
    title: "Nova Cloud",
    tagline: "全球分布式算力基础设施",
    description: "下一代 Serverless 平台，具备边缘计算能力。TokenPlus 确保全球用户享受低于 10ms 的极速延迟，为 AI 资源调度提供强力支撑。",
    iconName: "Cloud",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://i.ibb.co/pTCv4NR/89200172-09c2-4d82-9260-2aaa2eac19fd.jpg",
    color: "#3b82f6",
    link: "#",
    sortOrder: 2,
  },
  {
    id: "3",
    title: "Pulse Analytics",
    tagline: "实时数据监控与可视化",
    description: "将原始数据转化为精美的实时看板。TokenPlus 的数据监控系统支持每秒处理数百万次请求，零延迟洞察 AI 流量波动。",
    iconName: "BarChart3",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    hoverImage: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=800",
    color: "#10b981",
    link: "#",
    sortOrder: 3,
  },
  {
    id: "4",
    title: "Zenith OS",
    tagline: "深层优化 AI 开发操作系统",
    description: "极简主义操作系统，专为高性能开发设计。优化系统资源调度，提升 AI 训练与推理效率，消除一切干扰。",
    iconName: "Monitor",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    color: "#f59e0b",
    link: "#",
    sortOrder: 4,
  },
  {
    id: "5",
    title: "Volt Engine",
    tagline: "极速 JavaScript 运行环境",
    description: "全球领先的超高速运行时环境，专为现代 Web 标准设计。为 AI 应用提供卓越的逻辑处理能力与执行效率。",
    iconName: "Zap",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    color: "#ef4444",
    link: "#",
    sortOrder: 5,
  },
  {
    id: "6",
    title: "Sentinel",
    tagline: "零信任 AI 安全审计",
    description: "全自动安全审计与威胁检测系统。集成于 CI/CD 流水线中，在代码发布前多维度扫描风险，保护您的数字资产安全。",
    iconName: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    color: "#ec4899",
    link: "#",
    sortOrder: 6,
  }
];
