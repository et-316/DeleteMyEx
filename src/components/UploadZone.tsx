import { ImagePlus } from "lucide-react";
import { useCallback } from "react";
import { Camera } from "@capacitor/camera";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PhotoWithAssetId {
  file: File;
  assetId?: string;
}

interface UploadZoneProps {
  onFilesSelected: (photos: PhotoWithAssetId[]) => void;
}

export const UploadZone = ({ onFilesSelected }: UploadZoneProps) => {
  const { toast } = useToast();

  const handleNativePhotoPicker = useCallback(async () => {
    try {
      const photos = await Camera.pickImages({
        quality: 90,
        limit: 0, // 0 means no limit
      });

      if (!photos.photos || photos.photos.length === 0) {
        return;
      }

      // Convert photos to File objects and preserve asset IDs
      const filesWithAssetIds = await Promise.all(
        photos.photos.map(async (photo, index) => {
          const response = await fetch(photo.webPath!);
          const blob = await response.blob();
          const file = new File([blob], `photo-${index}.jpg`, { type: "image/jpeg" });
          
          // Extract asset ID from photo path if available
          // iOS format: "assets-library://asset/asset.JPG?id=XXXX&ext=JPG"
          let assetId: string | undefined;
          if (photo.path && photo.path.includes('id=')) {
            const match = photo.path.match(/id=([^&]+)/);
            if (match) {
              assetId = match[1];
            }
          }
          
          return { file, assetId };
        })
      );

      onFilesSelected(filesWithAssetIds);
    } catch (error) {
      console.error("Error picking photos:", error);
      toast({
        title: "Error",
        description: "Failed to access photo library. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [onFilesSelected, toast]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center w-full p-12 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Choose Photos</h2>
          <p className="text-muted-foreground">
            Select photos from your library to get started
          </p>
        </div>

        <Button
          onClick={handleNativePhotoPicker}
          size="lg"
          className="h-32 px-12 flex-col gap-3 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
        >
          <ImagePlus className="w-12 h-12" />
          <span className="text-xl font-semibold">Select from Photo Library</span>
        </Button>
        
        <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
          Includes photos from all albums, including Hidden
        </p>
      </div>
    </div>
  );
};
