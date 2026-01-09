import React, { useState, useEffect } from 'react';
import { Users, Home, Package, DollarSign, FileText, BarChart3, Settings, MapPin, Calendar, TrendingUp, AlertCircle, Search, Filter, Plus, Trash2, Edit, Eye, Download, Menu, X, Building2 } from 'lucide-react';

// Componente: Painel Inicial
const Dashboard = () => {
  return (
    <div className="space-y-6" style={{ border: "none"}}>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Sistema</h2>
        <p className="text-gray-600">Painel de controle do mercado de vendas</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Vendedores</p>
          <p className="text-3xl font-bold text-gray-800">156</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Receita Semanal</p>
          <p className="text-3xl font-bold text-gray-800">6.8M Kz</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Pagamentos Pendentes</p>
          <p className="text-3xl font-bold text-gray-800">23</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Espaços Ocupados</p>
          <p className="text-3xl font-bold text-gray-800">204/224</p>
        </div>
      </div>

      {/* Visão Rápida dos Blocos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ocupação por Bloco</h3>
          <div className="space-y-4">
            {['A', 'B', 'C', 'D', 'E'].map((block, idx) => {
              const occupation = [84, 92, 89, 95, 92][idx];
              return (
                <div key={block}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Bloco {block}</span>
                    <span className="text-sm text-gray-600">{occupation}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${occupation}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { name: 'João Silva', action: 'Pagamento realizado', time: 'Há 2 horas', color: 'green' },
              { name: 'Maria Costa', action: 'Pagamento pendente', time: 'Há 5 horas', color: 'orange' },
              { name: 'Pedro Santos', action: 'Novo registro', time: 'Há 1 dia', color: 'blue' },
              { name: 'Ana Ferreira', action: 'Pagamento realizado', time: 'Há 1 dia', color: 'green' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full bg-${activity.color}-500`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard