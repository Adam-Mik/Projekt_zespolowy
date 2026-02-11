// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api, authApi } from '../api/client';

const { width } = Dimensions.get('window');

interface Expense {
  id: string;
  name: string;
  amount: string;
  person_paying: number;
  description?: string;
  group?: string;
  date?: string;
}

interface Group {
  id: string;
  name: string;
  members: number[];
}

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', description: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      // Pobieramy grupy
      const groupsRes = await api.get('/groups/');
      setGroups(groupsRes.data);

      // Jeśli mamy grupy, pobieramy wydatki z pierwszej grupy
      if (groupsRes.data.length > 0) {
        setSelectedGroupId(groupsRes.data[0].id);
      }

      // Pobieramy wydatki
      const expensesRes = await api.get('/expenses/');
      setExpenses(expensesRes.data);
    } catch (err: any) {
      console.log('Błąd pobierania danych:', err);
      Alert.alert('Błąd', 'Nie można pobrać danych. Sprawdź czy jesteś zalogowany.');
    } finally {
      setLoading(false);
    }
  };

  const addNewExpense = async () => {
    console.log('Walidacja:', { name: newExpense.name, amount: newExpense.amount, selectedGroupId });
    
    if (!newExpense.name || !newExpense.name.trim()) {
      Alert.alert('Błąd', 'Wpisz nazwę wydatku');
      return;
    }

    if (!newExpense.amount || !newExpense.amount.trim()) {
      Alert.alert('Błąd', 'Wpisz kwotę wydatku');
      return;
    }

    if (!selectedGroupId) {
      // Jeśli nie ma wybranej grupy, spróbujemy utworzyć nową
      try {
        const newGroup = await api.post('/groups/', { name: 'Moja grupa' });
        setSelectedGroupId(newGroup.data.id);
        // Spróbuj dodać wydatek ponownie
        return addNewExpense();
      } catch (err) {
        Alert.alert('Błąd', 'Brak grupy. Proszę poczekać na załadowanie danych.');
        return;
      }
    }

    try {
      await api.post('/expenses/', {
        group: selectedGroupId,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
      });
      setNewExpense({ name: '', amount: '', description: '' });
      setShowAddForm(false);
      loadData();
      Alert.alert('Sukces', 'Wydatek został dodany');
    } catch (err: any) {
      console.log('Błąd dodawania wydatku:', err);
      Alert.alert('Błąd', 'Nie można dodać wydatku');
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

  const expensesByPerson = expenses.reduce((acc, expense) => {
    const personId = expense.person_paying?.toString() || 'Nieznany';
    const existing = acc.find(item => item.id === personId);
    if (existing) {
      existing.amount += parseFloat(expense.amount || '0');
    } else {
      acc.push({ id: personId, name: `Użytkownik ${personId}`, amount: parseFloat(expense.amount || '0') });
    }
    return acc;
  }, [] as Array<{ id: string; name: string; amount: number }>);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Wydatki</Text>
          <MaterialCommunityIcons name="wallet-outline" size={32} color="#38bdf8" />
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Suma wydatków</Text>
            <Text style={styles.summaryAmount}>{totalExpenses.toFixed(2)} zł</Text>
          </View>
          <MaterialCommunityIcons name="chart-line" size={40} color="#38bdf8" />
        </View>

        {!showAddForm ? (
          <TouchableOpacity 
            style={[styles.addButton, !selectedGroupId && styles.disabledButton]} 
            onPress={() => setShowAddForm(true)}
            disabled={!selectedGroupId}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#0f172a" />
            <Text style={styles.addButtonText}>Dodaj wydatek</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Nowy wydatek</Text>
            {!selectedGroupId && (
              <View style={styles.warningBox}>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#f59e0b" />
                <Text style={styles.warningText}>Ładowanie grup... Proszę czekać</Text>
              </View>
            )}
            {groups.length === 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Brak grup. Zostanie utworzona automatycznie.</Text>
              </View>
            )}
            <TextInput
              placeholder="Nazwa"
              placeholderTextColor="#64748b"
              value={newExpense.name}
              onChangeText={(text) => setNewExpense({...newExpense, name: text})}
              style={styles.formInput}
            />
            <TextInput
              placeholder="Kwota (zł)"
              placeholderTextColor="#64748b"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
              keyboardType="decimal-pad"
              style={styles.formInput}
            />
            <TextInput
              placeholder="Opis (opcjonalnie)"
              placeholderTextColor="#64748b"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({...newExpense, description: text})}
              style={styles.formInput}
            />
            <View style={styles.formButtonGroup}>
              <TouchableOpacity style={styles.formSubmitButton} onPress={addNewExpense}>
                <Text style={styles.formSubmitButtonText}>Dodaj</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formCancelButton} onPress={() => setShowAddForm(false)}>
                <Text style={styles.formCancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="inbox" size={64} color="#334155" />
            <Text style={styles.emptyText}>Brak wydatków</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.listTitle}>Historia wydatków</Text>
            {expenses.map((item) => (
              <View key={item.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View>
                    <Text style={styles.expenseTitle}>{item.name}</Text>
                    <Text style={styles.expensePaidBy}>ID użytkownika: {item.person_paying}</Text>
                    {item.description && <Text style={styles.expenseDescription}>{item.description}</Text>}
                  </View>
                  <Text style={styles.expenseAmount}>{parseFloat(item.amount).toFixed(2)} zł</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  summaryCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#38bdf8',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  chartContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderLeftWidth: 5,
    borderLeftColor: '#38bdf8',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  chartContent: {
    height: 200,
    justifyContent: 'flex-end',
  },
  noDataText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  },
  barsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 45,
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 6,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f1f5f9',
    textAlign: 'center',
  },
  barAmount: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#64748b',
    shadowOpacity: 0.2,
  },
  addButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#38bdf8',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  expensePaidBy: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13,
  },
  expenseAmount: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  expenseDescription: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 12,
  },
  formCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  infoText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    color: '#f1f5f9',
    marginBottom: 10,
  },
  formButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  formSubmitButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  formSubmitButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formCancelButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  formCancelButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginTop: 16,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  amount: {
    color: '#38bdf8',
    fontSize: 16,
    marginTop: 4,
  },
  paidBy: {
    color: '#94a3b8',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#38bdf8',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
