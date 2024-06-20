---
import { getCollection } from "astro:content";
import { getImage } from 'astro:assets';
import Homepage from "../components/Homepage.astro";

const collections = ['long_form', 'short_form', 'muses', 'zeitweilig'];

async function getRandomImages() {
  let allImages = [];
  let allAlts = [];
  let allUrls = [];

  for (let collection of collections) {
    const allContent = await getCollection(collection);

    // Filter posts with images and subimages
    const postsWithImages = allContent.filter(post =>
      (post.data.image?.src && post.data.image?.alt) ||
      (post.data.subimage && post.data.subimage.length > 0)
    );

    const imagePromises = postsWithImages.map(async post => {
      let images = [];

      // Add main image if exists
      if (post.data.image?.src && post.data.image?.alt) {
        images.push({
          src: post.data.image.src,
          alt: post.data.image.alt,
          positionx: post.data.image.positionx,
          positiony: post.data.image.positiony
        });
      }

      // Add subimages if exist
      if (post.data.subimage && post.data.subimage.length > 0) {
        images.push(...post.data.subimage);
      }

      // Randomly select an image from the images array
      const randomImage = images[Math.floor(Math.random() * images.length)];

      const imageAsset = await getImage({
        src: randomImage.src,
        alt: randomImage.alt,
        width: "1920",
        height: "1080",
        decoding: "async",
        format: "avif",
        quality: "65"
      });

      return {
        imageSrc: imageAsset ? imageAsset.src : null,
        alt: randomImage.alt,
        url: `/${collection}/${post.slug}`
      };
    });

    const results = await Promise.all(imagePromises);

    allImages.push(...results.map(result => result.imageSrc));
    allAlts.push(...results.map(result => result.alt));
    allUrls.push(...results.map(result => result.url));
  }

  return { allImages, allAlts, allUrls };
}

const { allImages, allAlts, allUrls } = await getRandomImages();
---

{allImages.length > 0 ? (
  <Homepage 
    title={Astro.props.pageTitle} 
    images={JSON.stringify(allImages)} 
    alt={JSON.stringify(allAlts)} 
    urls={JSON.stringify(allUrls)} 
    width="1920" 
    height="1080" 
  />
) : (
  <p>No images found</p>
)}
