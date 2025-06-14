
import React, { useState } from 'react';
import { Plus, ExternalLink, Eye, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCatalogues } from '@/hooks/useCatalogues';
import CreateCatalogueDialog from './CreateCatalogueDialog';
import EditCatalogueDialog from './EditCatalogueDialog';
import CatalogueItemsDialog from './CatalogueItemsDialog';

const CatalogueManagement = () => {
  const { catalogues, isLoading, deleteCatalogue } = useCatalogues();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);

  const filteredCatalogues = catalogues.filter(catalogue =>
    catalogue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalogue.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditCatalogue = (catalogue: any) => {
    setSelectedCatalogue(catalogue);
    setIsEditDialogOpen(true);
  };

  const handleManageItems = (catalogue: any) => {
    setSelectedCatalogue(catalogue);
    setIsItemsDialogOpen(true);
  };

  const handleViewCatalogue = (catalogue: any) => {
    const url = `${window.location.origin}/catalogue/${catalogue.public_url_slug}`;
    window.open(url, '_blank');
  };

  const handleDeleteCatalogue = async (catalogueId: string) => {
    if (confirm('Are you sure you want to delete this catalogue?')) {
      deleteCatalogue(catalogueId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading catalogues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Catalogues</h1>
          <p className="text-muted-foreground">
            Create and share product catalogues with your customers
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Catalogue
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search catalogues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Catalogues Grid */}
      {filteredCatalogues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No catalogues yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first catalogue to start sharing products with customers
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Catalogue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalogues.map((catalogue) => (
            <Card key={catalogue.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{catalogue.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {catalogue.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={catalogue.is_active ? 'default' : 'secondary'}>
                    {catalogue.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    URL: /{catalogue.public_url_slug}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCatalogue(catalogue)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCatalogue(catalogue)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManageItems(catalogue)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Items
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCatalogue(catalogue)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCatalogue(catalogue.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateCatalogueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditCatalogueDialog
        catalogue={selectedCatalogue}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <CatalogueItemsDialog
        catalogue={selectedCatalogue}
        open={isItemsDialogOpen}
        onOpenChange={setIsItemsDialogOpen}
      />
    </div>
  );
};

export default CatalogueManagement;
