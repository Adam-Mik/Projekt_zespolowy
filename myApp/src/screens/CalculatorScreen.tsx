// src/screens/CalculatorScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CalculationHistory {
  id: string;
  people: number;
  total: number;
  perPerson: number;
  tip: number;
  timestamp: Date;
}

export default function CalculatorScreen() {
  const [people, setPeople] = useState('2');
  const [total, setTotal] = useState('100');
  const [tipPercent, setTipPercent] = useState(0);
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  const numPeople = Number(people) || 1;
  const numTotal = Number(total) || 0;
  const tipAmount = numTotal * (tipPercent / 100);
  const totalWithTip = numTotal + tipAmount;
  const perPerson = totalWithTip / numPeople;

  const addToHistory = () => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      people: numPeople,
      total: numTotal,
      perPerson: perPerson,
      tip: tipAmount,
      timestamp: new Date(),
    };
    setHistory([newEntry, ...history]);
    setPeople('2');
    setTotal('0');
    setTipPercent(0);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const averagePerPerson = history.length > 0 
    ? (history.reduce((sum, item) => sum + item.perPerson, 0) / history.length) 
    : 0;

  const TipButton = ({ percent }: { percent: number }) => (
    <TouchableOpacity
      style={[styles.tipButton, tipPercent === percent && styles.tipButtonActive]}
      onPress={() => setTipPercent(tipPercent === percent ? 0 : percent)}
    >
      <Text style={[styles.tipButtonText, tipPercent === percent && styles.tipButtonTextActive]}>
        +{percent}%
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Kalkulator kosztów</Text>
          <MaterialCommunityIcons name="calculator" size={32} color="#38bdf8" />
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Liczba osób</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-multiple" size={20} color="#38bdf8" />
              <TextInput
                placeholder="Liczba osób"
                placeholderTextColor="#64748b"
                value={people}
                onChangeText={setPeople}
                keyboardType="numeric"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Łączny koszt</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#38bdf8" />
              <TextInput
                placeholder="Łączny koszt"
                placeholderTextColor="#64748b"
                value={total}
                onChangeText={setTotal}
                keyboardType="decimal-pad"
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.tipSection}>
          <Text style={styles.tipLabel}>Napiwek:</Text>
          <View style={styles.tipButtons}>
            <TipButton percent={10} />
            <TipButton percent={15} />
            <TipButton percent={20} />
          </View>
          {tipAmount > 0 && (
            <Text style={styles.tipInfo}>Napiwek: {tipAmount.toFixed(2)} zł</Text>
          )}
        </View>

        <View style={styles.resultCard}>
          <View>
            <Text style={styles.resultLabel}>Koszt na osobę</Text>
            <Text style={styles.resultAmount}>{perPerson.toFixed(2)} zł</Text>
          </View>
          <View style={styles.resultIcon}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#38bdf8" />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={addToHistory}>
            <MaterialCommunityIcons name="plus" size={20} color="#0f172a" />
            <Text style={styles.actionButtonText}>Dodaj do zapisów</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => { 
              setPeople('2'); 
              setTotal('0'); 
              setTipPercent(0);
            }}
          >
            <MaterialCommunityIcons name="restart" size={20} color="#64748b" />
            <Text style={styles.resetButtonText}>Resetuj</Text>
          </TouchableOpacity>
        </View>

        {history.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Historia obliczeń ({history.length})</Text>
              <TouchableOpacity onPress={clearHistory}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#f87171" />
              </TouchableOpacity>
            </View>

            {history.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Średnia</Text>
                  <Text style={styles.statValue}>{averagePerPerson.toFixed(2)} zł</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Operacji</Text>
                  <Text style={styles.statValue}>{history.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Razem napiwków</Text>
                  <Text style={styles.statValue}>{history.reduce((sum, item) => sum + item.tip, 0).toFixed(2)} zł</Text>
                </View>
              </View>
            )}

            <FlatList
              data={history}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View style={styles.historyIconCircle}>
                      <MaterialCommunityIcons name="history" size={20} color="#38bdf8" />
                    </View>
                    <View>
                      <Text style={styles.historyItemTitle}>
                        {item.people} osób • {item.total.toFixed(2)} zł
                      </Text>
                      <Text style={styles.historyItemSubtitle}>
                        {item.timestamp.toLocaleTimeString('pl-PL')}
                        {item.tip > 0 && ` • Napiwek: ${item.tip.toFixed(2)} zł`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={styles.historyItemAmount}>{item.perPerson.toFixed(2)} zł</Text>
                    <TouchableOpacity onPress={() => deleteFromHistory(item.id)}>
                      <MaterialCommunityIcons name="close" size={18} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
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
  inputSection: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInput: {
    flex: 1,
    padding: 12,
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  tipSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    fontWeight: '600',
  },
  tipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
  },
  tipButtonActive: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tipButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 12,
  },
  tipButtonTextActive: {
    color: '#f59e0b',
  },
  tipInfo: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  resultIcon: {
    opacity: 0.8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  historySection: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  historyItem: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#64748b',
  },
  historyItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  historyItemTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  historyItemSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  historyItemAmount: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
