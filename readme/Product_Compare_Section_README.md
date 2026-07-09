# Product Compare Section -- README

## Overview

The **Product Compare** section allows customers to compare similar
products directly from the Product Detail Page (PDP). This helps
customers evaluate product differences and make informed purchasing
decisions.

------------------------------------------------------------------------

## Objectives

-   Improve customer buying decisions.
-   Increase product discovery.
-   Reduce bounce rate.
-   Display key product differences in one place.
-   Keep the section easy to manage through Shopify Admin.

------------------------------------------------------------------------

# Implementation Options

## Option 1 -- Product List Metafield ⭐ (Recommended)

### Shopify Admin

**Settings → Custom Data → Products**

Create a metafield:

  Field       Value
  ----------- ------------------
  Name        Compare Products
  Namespace   custom
  Key         compare_products
  Type        Product List

### Workflow

Current Product → Select Compare Products → Product Compare Section
Displays Automatically

### Advantages

-   Easy to manage
-   Dynamic
-   No code changes required
-   Works with any collection
-   Merchant controlled
-   Scalable for large catalogs

### Disadvantages

-   Merchant must manually select comparison products.

------------------------------------------------------------------------

## Option 2 -- Metaobjects ⭐⭐⭐⭐⭐

Use a Metaobject to manage custom comparison content.

### Suggested Fields

-   Product Reference
-   Custom Title
-   Description
-   Badge
-   Feature List
-   Icons
-   Notes

### Advantages

-   Highly flexible
-   Marketing friendly
-   Rich content support
-   Future-proof

### Disadvantages

-   More initial setup

------------------------------------------------------------------------

## Option 3 -- Theme Customizer (Schema Settings)

Allow merchants to manually choose products from the Theme Editor.

### Advantages

-   Simple implementation
-   Suitable for small catalogs

### Disadvantages

-   Not scalable
-   Requires manual configuration for each template

------------------------------------------------------------------------

## Option 4 -- Automatic Comparison

Automatically compare products based on:

-   Same Collection
-   Same Vendor
-   Same Product Type
-   Same Category

### Advantages

-   No manual setup

### Disadvantages

-   May display less relevant products

------------------------------------------------------------------------

# Recommended Comparison Information

-   Product Image
-   Product Title
-   Price
-   Compare-at Price
-   Rating
-   Reviews
-   Vendor
-   Availability
-   Color Options
-   Size Options
-   Material
-   Weight
-   Dimensions
-   Warranty
-   Add to Cart Button
-   View Product Button

------------------------------------------------------------------------

# Responsive Behaviour

### Desktop

-   4 products

### Tablet

-   3 products

### Mobile

-   Horizontal slider

------------------------------------------------------------------------

# Theme Customizer Settings

-   Section Heading
-   Description
-   Products per Row
-   Enable Slider
-   Show Rating
-   Show Vendor
-   Show Availability
-   Show Material
-   Show Warranty
-   Show Add to Cart
-   Background Color
-   Text Color
-   Padding
-   Spacing

------------------------------------------------------------------------

# Best Practice Recommendation

Use a **Product List metafield** to manage the products being compared.

Automatically pull standard Shopify product information such as:

-   Image
-   Price
-   Availability
-   Variants
-   Ratings

Store additional comparison attributes (Material, Warranty, Dimensions,
etc.) using **Product Metafields** or **Metaobjects**.

### Benefits

-   Easy to manage from Shopify Admin
-   Scalable for large product catalogs
-   No theme updates required when products change
-   Dynamic and reusable
-   Follows Shopify best practices
