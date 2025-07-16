import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Scan } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCatalogProps {
  onAddToCart: (product: Product, priceType: string) => void;
  selectedPriceType: string;
}

export function ProductCatalog({ onAddToCart, selectedPriceType }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory === "All" ? undefined : selectedCategory, searchQuery || undefined].filter(Boolean),
  });

  const categories = ["All", "Cakes", "Pastries", "Breads", "Sweets"];

  const getPrice = (product: Product) => {
    switch (selectedPriceType) {
      case "wholesale":
        return parseFloat(product.wholesalePrice);
      case "custom":
        return parseFloat(product.customPrice || product.counterPrice);
      default:
        return parseFloat(product.counterPrice);
    }
  };

  const handleBarcodeScanner = () => {
    // Mock barcode scanning
    const mockBarcodes = ["1234567890123", "1234567890124", "1234567890125"];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    
    const product = products?.find(p => p.barcode === randomBarcode);
    if (product) {
      onAddToCart(product, selectedPriceType);
      alert(`Scanned: ${product.name} - Added to cart!`);
    } else {
      alert("Product not found for scanned barcode");
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="w-full h-24 bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Catalog</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={handleBarcodeScanner} variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
          {products?.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onAddToCart(product, selectedPriceType)}
            >
              <img
                src={product.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"}
                alt={product.name}
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{product.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{getPrice(product).toFixed(2)}/{product.unit}
                </span>
                <Badge variant={product.stock <= 10 ? "destructive" : "secondary"} className="text-xs">
                  {product.stock} left
                </Badge>
              </div>
            </div>
          ))}
          {!products?.length && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
