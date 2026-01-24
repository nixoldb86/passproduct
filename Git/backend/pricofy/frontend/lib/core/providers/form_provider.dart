// Form Provider
//
// Migrated from pricofy-frontend/contexts/FormContext.tsx
// Manages product form modal state (open/closed) and initial action

import 'package:flutter/material.dart';

enum FormAction { vender, comprar }

class FormProvider extends ChangeNotifier {
  bool _isFormOpen = false;
  FormAction _initialAction = FormAction.vender;

  bool get isFormOpen => _isFormOpen;
  FormAction get initialAction => _initialAction;

  /// Open form with specified action
  void openForm(FormAction action) {
    _initialAction = action;
    _isFormOpen = true;
    notifyListeners();
  }

  /// Close form
  void closeForm() {
    _isFormOpen = false;
    notifyListeners();
  }

  /// Open form to sell
  void openSellForm() {
    openForm(FormAction.vender);
  }

  /// Open form to buy
  void openBuyForm() {
    openForm(FormAction.comprar);
  }
}
