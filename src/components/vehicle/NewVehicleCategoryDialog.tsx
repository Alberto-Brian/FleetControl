// ========================================
// FILE: src/components/vehicle-category/NewVehicleCategoryDialog.tsx (REDESENHADO)
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { Plus, Tag } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { createVehicleCategory, restoreVehicleCategory } from '@/helpers/vehicle-category-helpers';
import { ICreateVehicleCategory } from '@/lib/types/vehicle-category';
import { useVehicles } from '@/contexts/VehiclesContext';

export default function NewVehicleCategoryDialog() { 
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { addCategory, updateCategory } = useVehicles();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateVehicleCategory>({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  // ✅ Paleta reduzida e discreta
  const colorOptions = [
    { value: '#3b82f6', label: 'Azul' },
    { value: '#10b981', label: 'Verde' },
    { value: '#f59e0b', label: 'Âmbar' },
    { value: '#ef4444', label: 'Vermelho' },
    { value: '#8b5cf6', label: 'Roxo' },
    { value: '#ec4899', label: 'Rosa' },
    { value: '#06b6d4', label: 'Ciano' },
    { value: '#f97316', label: 'Laranja' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newCategory = await createVehicleCategory(formData);
      
      if (newCategory) {
        addCategory(newCategory);
        showSuccess(t('vehicles:toast.categoryCreateSuccess'));
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      // ✨ Handler com callback que RETORNA PROMISE
      handleError(
        error, 
        'vehicles:toast.categoryCreateError',
        async (actionType, actionData) => {
          // ⚠️ IMPORTANTE: Este callback DEVE retornar uma Promise
          if (actionType === 'RESTORE_CATEGORY') {
            // ✨ A função já retorna Promise, então o toast.promise funciona
            const restored = await restoreVehicleCategory(actionData.categoryId);
            
            if (restored) {
              updateCategory(restored); // Atualiza no contexto
              setOpen(false);
              resetForm();
            }
            
            // ✨ Se chegar aqui, sucesso! O toast.promise mostra a mensagem de success
            // ✨ Se der erro, o catch do toast.promise pega e mostra a mensagem de error
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="new-category-trigger">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Nova Categoria de Veículo
          </DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar seus veículos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ LAYOUT DE 2 COLUNAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUNA ESQUERDA - Inputs */}
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Nome da Categoria *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Utilitário, Passeio, Carga..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Veículos para transporte de carga leve..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* ✅ Cor como SELECT discreto */}
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-semibold">
                  Cor (opcional)
                </Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A cor ajuda a identificar visualmente a categoria
                </p>
              </div>
            </div>

            {/* COLUNA DIREITA - Preview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Preview</Label>
                <div className="p-6 bg-muted/50 rounded-xl border-2 border-dashed border-muted">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {/* Ícone grande */}
                    <div 
                      className="w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center transition-all"
                      style={{ backgroundColor: `${formData.color}15` }}
                    >
                      <Tag className="w-10 h-10" style={{ color: formData.color }} />
                    </div>
                    
                    {/* Nome */}
                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {formData.name || 'Nome da Categoria'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.description || 'Descrição da categoria'}
                      </p>
                    </div>

                    {/* Badge de cor */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-xs font-mono font-semibold">{formData.color}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info adicional */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>💡 Dica:</strong> Escolha cores diferentes para cada categoria para facilitar a identificação visual dos veículos.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}