# Upload Out Files to Tencent Cloud COS

## Step 1: Manual Upload (Recommended)

1. **Login to Tencent Cloud Console**
   - Go to: https://console.cloud.tencent.com/cos
   - Navigate to Object Storage COS

2. **Find Your Bucket**
   - Click on your bucket name to enter

3. **Upload Files**
   - Click "Upload File" or "Upload Folder"
   - Select the `out` directory
   - Upload all files to the bucket root directory

4. **Set Permissions**
   - Ensure files are set to "Public Read"
   - Check access permissions

## Step 2: Test Your Website

After uploading, test your website:

1. **Open Test Tool**
   - Open `test-uploaded-site.html` in your browser
   - Enter your website URL
   - Run all tests

2. **Manual Testing**
   - Visit your static website URL
   - Test each page:
     - Homepage (index.html)
     - Background removal (background.html)
     - Image search (search.html)
     - Image resize (resize.html)

## Step 3: Verify API Connection

Your website should connect to:
- API URL: `https://1300931050-izxeco6na5.ap-guangzhou.tencentscf.com`
- Test endpoints:
  - `/health` - Health check
  - `/ocr` - OCR functionality
  - `/remove-background` - Background removal

## Files to Upload

```
out/
├── index.html          # Homepage
├── background.html     # Background removal page
├── search.html         # Image search page
├── resize.html         # Image resize page
├── 404.html           # Error page
└── _next/             # Static resources
    └── static/
        ├── chunks/    # JavaScript files
        ├── css/       # CSS files
        └── [other files]
```

## Troubleshooting

### If pages don't load:
- Check file permissions (should be public read)
- Verify all files uploaded to root directory
- Check static resources are complete

### If API calls fail:
- Verify cloud function is running
- Check CORS configuration
- Test API endpoints directly

### If styles don't work:
- Ensure `_next/static/` directory uploaded completely
- Check CSS files are accessible

## Success Indicators

✅ All HTML pages load correctly
✅ Static resources (CSS/JS) load
✅ API calls work properly
✅ Functions (OCR, background removal) work
✅ No console errors in browser

---

**Your PhotoBox application should now be fully functional on Tencent Cloud!**

