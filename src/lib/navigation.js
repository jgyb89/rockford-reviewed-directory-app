import {
  Utensils,
  HeartPulse,
  Home,
  Coffee,
  Pizza,
  Beer,
  ChefHat,
  Stethoscope,
  Dumbbell,
  Flower,
  Smile,
  Hammer,
  Wrench,
  Brush,
  Zap,
  Leaf,
} from "lucide-react";
import categoriesData from "./categories-data.json";

const ICON_MAP = {
  Utensils: <Utensils size={20} />,
  HeartPulse: <HeartPulse size={20} />,
  Home: <Home size={20} />,
  Coffee: <Coffee size={20} />,
  Pizza: <Pizza size={20} />,
  Beer: <Beer size={20} />,
  ChefHat: <ChefHat size={20} />,
  Stethoscope: <Stethoscope size={20} />,
  Dumbbell: <Dumbbell size={20} />,
  Flower: <Flower size={20} />,
  Smile: <Smile size={20} />,
  Hammer: <Hammer size={20} />,
  Wrench: <Wrench size={20} />,
  Brush: <Brush size={20} />,
  Zap: <Zap size={20} />,
  Leaf: <Leaf size={20} />,
};

const SUB_ICON_MAP = {
  Utensils: <Utensils size={16} />,
  HeartPulse: <HeartPulse size={16} />,
  Home: <Home size={16} />,
  Coffee: <Coffee size={16} />,
  Pizza: <Pizza size={16} />,
  Beer: <Beer size={16} />,
  ChefHat: <ChefHat size={16} />,
  Stethoscope: <Stethoscope size={16} />,
  Dumbbell: <Dumbbell size={16} />,
  Flower: <Flower size={16} />,
  Smile: <Smile size={16} />,
  Hammer: <Hammer size={16} />,
  Wrench: <Wrench size={16} />,
  Brush: <Brush size={16} />,
  Zap: <Zap size={16} />,
  Leaf: <Leaf size={16} />,
};

export const categories = categoriesData.map(cat => ({
  ...cat,
  icon: ICON_MAP[cat.iconName],
  subs: cat.subs.map(sub => ({
    ...sub,
    icon: SUB_ICON_MAP[sub.iconName]
  }))
}));
