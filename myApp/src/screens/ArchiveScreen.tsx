// src/screens/ArchiveScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../api/client';

interface Expense {
  id: string;
  name: string;
  amount: string;
  person_paying: number;
  description?: string;
  date?: string;
  is_deleted?: boolean;
}

export default function ArchiveScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArchive = async () => {
    try {
      setLoading(true);
      // Pobieramy wszystkie wydatki - jeśli backend obsługuje soft delete,
      // można dodać filtrowanie po is_deleted=true
      const res = await api.get('/expenses/');
      setExpenses(res.data || []);
    } catch (err) {
      console.log('Błąd pobierania archiwum:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const totalArchived = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

  useEffect(() => {
    loadArchive();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Archiwum</Text>
        <MaterialCommunityIcons name="archive-outline" size={32} color="#38bdf8" />
      </View>

      {expenses.length > 0 && (
        <View style={styles.statsCard}>
          <View>
            <Text style={styles.statsLabel}>Zarchiwizowanych wydatków</Text>
            <Text style={styles.statsValue}>{expenses.length}</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.statsLabel}>Suma</Text>
            <Text style={styles.statsSum}>{totalArchived.toFixed(2)} zł</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox" size={80} color="#334155" />
          <Text style={styles.emptyText}>Brak zarchiwizowanych wydatków</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.archiveCard}>
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="history" size={24} color="#38bdf8" />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemPaidBy}>ID użytkownika: {item.person_paying}</Text>
                    {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
                    {item.date && <Text style={styles.itemDate}>{item.date}</Text>}
                  </View>
                </View>
                <Text style={styles.itemAmount}>{parseFloat(item.amount).toFixed(2)} zł</Text>
              </View>
            </View>
          )}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  statsCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderLeftWidth: 5,
    borderLeftColor: '#38bdf8',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  statsLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  statsSum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  divider: {
    width: 1,
    backgroundColor: '#334155',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  archiveCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  itemTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  itemPaidBy: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13,
  },
  itemDescription: {
    color: '#64748b',
    marginTop: 2,
    fontSize: 12,
  },
  itemDate: {
    color: '#64748b',
    marginTop: 2,
    fontSize: 12,
  },
  itemAmount: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});