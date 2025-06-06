
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface TagPrintTemplateProps {
  tags: Array<{
    tag_id: string;
    product_code: string;
    quantity: number;
    qr_code_data: string;
    category?: string;
    subcategory?: string;
  }>;
}

const TagPrintTemplate = ({ tags }: TagPrintTemplateProps) => {
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateQRCodes = async () => {
      const urls: Record<string, string> = {};
      
      for (const tag of tags) {
        try {
          const qrCodeUrl = await QRCode.toDataURL(tag.qr_code_data, {
            width: 128,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          urls[tag.tag_id] = qrCodeUrl;
        } catch (error) {
          console.error('Error generating QR code for tag:', tag.tag_id, error);
        }
      }
      
      setQrCodeUrls(urls);
    };

    generateQRCodes();
  }, [tags]);

  return (
    <div className="print-template">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-template, .print-template * {
            visibility: visible;
          }
          .print-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .tag-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .tag-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          padding: 20px;
        }
        
        .tag-item {
          border: 2px solid #000;
          padding: 15px;
          background: white;
          width: 300px;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        
        .tag-header {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .tag-id {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .product-code {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .qr-code {
          margin: 10px 0;
        }
        
        .quantity-info {
          font-size: 12px;
          font-weight: bold;
          margin-top: 5px;
        }
        
        .category-info {
          font-size: 10px;
          color: #666;
          text-align: center;
        }
      `}</style>
      
      <div className="tag-grid">
        {tags.map((tag) => (
          <div key={tag.tag_id} className="tag-item">
            <div className="tag-header">
              <div className="tag-id">{tag.tag_id}</div>
              <div className="product-code">{tag.product_code}</div>
            </div>
            
            {qrCodeUrls[tag.tag_id] && (
              <div className="qr-code">
                <img 
                  src={qrCodeUrls[tag.tag_id]} 
                  alt={`QR Code for ${tag.tag_id}`}
                  width="80"
                  height="80"
                />
              </div>
            )}
            
            <div className="quantity-info">
              Quantity: {tag.quantity}
            </div>
            
            {(tag.category || tag.subcategory) && (
              <div className="category-info">
                {tag.category} - {tag.subcategory}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagPrintTemplate;
